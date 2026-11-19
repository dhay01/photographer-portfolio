<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import gsap from 'gsap'
import SiteNav from '../components/SiteNav.vue'
import Breadcrumbs from '../components/Breadcrumbs.vue'
import MiniFooter from '../components/MiniFooter.vue'
import AmountField from '../components/AmountField.vue'
import { useSiteMotion } from '../composables/useSiteMotion'
import { useSite } from '../composables/useSite'
import {
  ENTRY_EXPENSE,
  ENTRY_INCOME,
  ROUND_TO,
  SAMPLE,
  gearMonthly,
  gearTotals,
  money,
  sessionPrice,
} from '../lib/pricing'

/**
 * The calculator is written for the workshop audience, so it reads in Arabic
 * whatever the rest of the site is set to. Change this to follow the site
 * locale instead once the language switcher is on (en.json has every string).
 */
const PAGE_LOCALE = 'ar'
const { t } = useI18n()
const tt = (key, named = {}) => t(key, named, { locale: PAGE_LOCALE })

const root = ref(null)
useSiteMotion(root)

const { site } = useSite()
const footerLinks = computed(() => {
  const instagram = site.value?.socials?.[0]
  return [
    ...(instagram ? [{ label: instagram.label, href: instagram.href }] : []),
    { key: 'courses', to: '/courses' },
    { key: 'home', to: '/' },
  ]
})

// ---------- state: lives in this tab only, never saved or sent ----------

const MAX_YEARS = 30
const MAX_SESSIONS = 300
const MAX_PROFIT = 50

let lastId = 0
const withId = (row) => ({ id: ++lastId, ...row })
const blankGear = () => withId({ name: '', price: 0, years: 0 })
const blankEntry = () => withId({ name: '', amount: 0, type: ENTRY_EXPENSE })

const fromSample = () => ({
  gear: SAMPLE.gear.map(withId),
  entries: SAMPLE.entries.map(withId),
  salary: SAMPLE.salary,
  profitRate: SAMPLE.profitRate,
  sessions: SAMPLE.sessions,
})

const state = reactive(fromSample())

const loadSample = () => Object.assign(state, fromSample())
const clearAll = () =>
  Object.assign(state, {
    gear: [blankGear()],
    entries: [blankEntry()],
    salary: 0,
    profitRate: SAMPLE.profitRate,
    sessions: 0,
  })

const removeRow = (list, id) => {
  const index = list.findIndex((row) => row.id === id)
  if (index >= 0) list.splice(index, 1)
}

const clamp = (value, max) => Math.min(max, Math.max(0, Math.round(value || 0)))
const nudge = (target, key, delta, max) => (target[key] = clamp(target[key] + delta, max))

const profitPercent = computed({
  get: () => Math.round(state.profitRate * 100),
  set: (value) => (state.profitRate = clamp(value, MAX_PROFIT) / 100),
})

const result = computed(() => sessionPrice(state))
const gearTotal = computed(() => gearTotals(state.gear))

// ---------- wizard ----------

const STEPS = ['gear', 'monthly', 'session']
const step = ref(0)
const stepper = ref(null)

const stepFigures = computed(() => [
  result.value.gearShare,
  result.value.workCost,
  result.value.floor,
])

const goTo = (index) => {
  step.value = index
  const top = stepper.value?.getBoundingClientRect().top ?? 0
  if (top < 0) stepper.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// ---------- the floor price counts up to each new answer ----------

const floorShown = ref(result.value.floor)
const counter = { value: floorShown.value }
let tween

watch(
  () => result.value.floor,
  (next) => {
    tween?.kill()
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      floorShown.value = counter.value = next
      return
    }
    tween = gsap.to(counter, {
      value: next,
      duration: 0.8,
      ease: 'power3.out',
      onUpdate: () => (floorShown.value = counter.value),
    })
  },
)

onBeforeUnmount(() => tween?.kill())
</script>

<template>
  <div ref="root" class="pricing">
    <SiteNav />

    <main class="calc" dir="rtl" lang="ar">
      <header class="calc__head">
        <Breadcrumbs
          :items="[{ label: tt('pricing.home'), to: '/' }, { label: tt('pricing.crumb') }]"
          class="calc__crumbs"
        />
        <span data-reveal class="eyebrow calc__eyebrow" lang="en" dir="ltr">
          {{ tt('pricing.eyebrow') }}
        </span>
        <div class="calc__head-row">
          <h1 data-reveal class="calc__title">{{ tt('pricing.title') }}</h1>
          <div data-reveal class="calc__intro">
            <p class="lede">{{ tt('pricing.intro') }}</p>
            <div class="calc__tools">
              <button type="button" class="btn btn--sm" @click="loadSample">
                {{ tt('pricing.loadSample') }}
              </button>
              <button type="button" class="btn btn--sm" @click="clearAll">
                {{ tt('pricing.clear') }}
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- The stepper doubles as the running answer: each step's figure feeds the next. -->
      <ol ref="stepper" class="stepper">
        <li v-for="(key, i) in STEPS" :key="key" class="stepper__item">
          <button
            type="button"
            :class="['stepper__btn', { 'is-on': step === i, 'is-done': step > i }]"
            :aria-current="step === i ? 'step' : null"
            @click="goTo(i)"
          >
            <span class="stepper__num" dir="ltr">{{ String(i + 1).padStart(2, '0') }}</span>
            <span class="stepper__label">{{ tt(`pricing.steps.${key}.short`) }}</span>
            <span class="stepper__figure" dir="ltr">{{ money(stepFigures[i]) }}</span>
          </button>
        </li>
      </ol>

      <section class="panel">
        <Transition name="step" mode="out-in">
          <div :key="step" class="panel__step">
            <div class="panel__head">
              <span class="eyebrow" lang="en" dir="ltr">{{ tt(`pricing.steps.${STEPS[step]}.eyebrow`) }}</span>
              <h2 class="panel__title">{{ tt(`pricing.steps.${STEPS[step]}.title`) }}</h2>
              <p class="panel__hint">{{ tt(`pricing.steps.${STEPS[step]}.hint`) }}</p>
            </div>

            <!-- 01 GEAR -->
            <div v-if="step === 0">
              <div class="rows rows--gear">
                <div class="rows__head">
                  <span>{{ tt('pricing.gear.item') }}</span>
                  <span>{{ tt('pricing.gear.price') }}</span>
                  <span>{{ tt('pricing.gear.years') }}</span>
                  <span>{{ tt('pricing.gear.monthly') }}</span>
                  <span />
                </div>
                <TransitionGroup name="row">
                  <div v-for="item in state.gear" :key="item.id" class="rows__row">
                    <input
                      v-model="item.name"
                      class="rows__name"
                      :placeholder="tt('pricing.gear.namePlaceholder')"
                      :aria-label="tt('pricing.gear.item')"
                    />
                    <AmountField v-model="item.price" :label="tt('pricing.gear.price')" />
                    <div class="count" role="group" :aria-label="tt('pricing.gear.years')">
                      <button type="button" :aria-label="tt('pricing.less')" @click="nudge(item, 'years', -1, MAX_YEARS)">−</button>
                      <output dir="ltr">{{ item.years }}</output>
                      <button type="button" :aria-label="tt('pricing.more')" @click="nudge(item, 'years', 1, MAX_YEARS)">+</button>
                    </div>
                    <span class="rows__out" dir="ltr" :data-unit="tt('pricing.gear.perMonth')">{{ money(gearMonthly(item)) }}</span>
                    <button type="button" class="rows__remove" :aria-label="tt('pricing.remove')" @click="removeRow(state.gear, item.id)">×</button>
                  </div>
                </TransitionGroup>
                <div class="rows__foot">
                  <button type="button" class="rows__add" @click="state.gear.push(blankGear())">
                    {{ tt('pricing.gear.add') }}
                  </button>
                  <span class="rows__total">
                    {{ tt('pricing.total') }}
                    <b dir="ltr">{{ money(gearTotal.price) }}</b>
                  </span>
                </div>
              </div>

              <div class="callout">
                <span>{{ tt('pricing.gear.saveEach') }}</span>
                <strong dir="ltr">{{ money(result.gearShare) }}</strong>
              </div>
            </div>

            <!-- 02 MONTHLY -->
            <div v-else-if="step === 1" class="split">
              <div class="rows rows--monthly">
                <div class="rows__head">
                  <span>{{ tt('pricing.monthly.item') }}</span>
                  <span>{{ tt('pricing.monthly.amount') }}</span>
                  <span>{{ tt('pricing.monthly.type') }}</span>
                  <span />
                </div>
                <TransitionGroup name="row">
                  <div v-for="entry in state.entries" :key="entry.id" class="rows__row">
                    <input
                      v-model="entry.name"
                      class="rows__name"
                      :placeholder="tt('pricing.monthly.namePlaceholder')"
                      :aria-label="tt('pricing.monthly.item')"
                    />
                    <AmountField v-model="entry.amount" :label="tt('pricing.monthly.amount')" />
                    <div class="toggle" role="radiogroup" :aria-label="tt('pricing.monthly.type')">
                      <button
                        v-for="type in [ENTRY_EXPENSE, ENTRY_INCOME]"
                        :key="type"
                        type="button"
                        role="radio"
                        :aria-checked="entry.type === type"
                        :class="['toggle__opt', { 'is-on': entry.type === type }]"
                        @click="entry.type = type"
                      >
                        {{ tt(`pricing.monthly.${type}`) }}
                      </button>
                    </div>
                    <button type="button" class="rows__remove" :aria-label="tt('pricing.remove')" @click="removeRow(state.entries, entry.id)">×</button>
                  </div>
                </TransitionGroup>
                <div class="rows__foot">
                  <button type="button" class="rows__add" @click="state.entries.push(blankEntry())">
                    {{ tt('pricing.monthly.add') }}
                  </button>
                  <span class="rows__total">
                    {{ tt('pricing.total') }}
                    <b dir="ltr">{{ money(result.monthly.net) }}</b>
                  </span>
                </div>
              </div>

              <div class="cards">
                <div class="card">
                  <span class="eyebrow" lang="en" dir="ltr">Gear</span>
                  <span class="card__label">{{ tt('pricing.receipt.gear') }}</span>
                  <span class="card__value" dir="ltr">{{ money(result.gearShare) }}</span>
                </div>
                <div class="card">
                  <span class="eyebrow" lang="en" dir="ltr">Monthly</span>
                  <span class="card__label">{{ tt('pricing.receipt.monthly') }}</span>
                  <span class="card__value" dir="ltr">{{ money(result.monthly.net) }}</span>
                  <span v-if="result.monthly.income" class="card__note">
                    {{ tt('pricing.receipt.incomeNote', { income: money(result.monthly.income) }) }}
                  </span>
                </div>
                <div class="card card--accent">
                  <span class="eyebrow" lang="en" dir="ltr">Total cost</span>
                  <span class="card__label">{{ tt('pricing.receipt.workCost') }}</span>
                  <span class="card__value" dir="ltr">{{ money(result.workCost) }}</span>
                  <span class="card__note">{{ tt('pricing.receipt.workCostNote') }}</span>
                </div>
              </div>
            </div>

            <!-- 03 THE MATH -->
            <div v-else class="split">
              <div>
                <div class="inputs">
                  <div class="input">
                    <span class="input__label">{{ tt('pricing.session.salary') }}</span>
                    <AmountField v-model="state.salary" :label="tt('pricing.session.salary')" />
                    <span class="input__hint">{{ tt('pricing.session.salaryHint') }}</span>
                  </div>

                  <div class="input">
                    <span class="input__label">
                      {{ tt('pricing.session.profit') }}
                      <b class="input__value" dir="ltr">{{ profitPercent }}%</b>
                    </span>
                    <input
                      v-model.number="profitPercent"
                      class="range"
                      type="range"
                      min="0"
                      :max="MAX_PROFIT"
                      step="1"
                      :aria-label="tt('pricing.session.profit')"
                    />
                    <span class="input__hint">{{ tt('pricing.session.profitHint') }}</span>
                  </div>

                  <div class="input">
                    <span class="input__label">{{ tt('pricing.session.sessions') }}</span>
                    <div class="count count--lg" role="group" :aria-label="tt('pricing.session.sessions')">
                      <button type="button" :aria-label="tt('pricing.less')" @click="nudge(state, 'sessions', -1, MAX_SESSIONS)">−</button>
                      <output dir="ltr">{{ state.sessions }}</output>
                      <button type="button" :aria-label="tt('pricing.more')" @click="nudge(state, 'sessions', 1, MAX_SESSIONS)">+</button>
                    </div>
                    <span class="input__hint">{{ tt('pricing.session.sessionsHint') }}</span>
                  </div>
                </div>

                <dl class="math">
                  <div><dt>{{ tt('pricing.receipt.workCost') }}</dt><dd dir="ltr">{{ money(result.workCost) }}</dd></div>
                  <div><dt>{{ tt('pricing.receipt.salary') }}</dt><dd dir="ltr">{{ money(state.salary) }}</dd></div>
                  <div class="math__dim"><dt>{{ tt('pricing.total') }}</dt><dd dir="ltr">{{ money(result.base) }}</dd></div>
                  <div><dt>{{ tt('pricing.receipt.profit', { rate: profitPercent }) }}</dt><dd dir="ltr">{{ money(result.profit) }}</dd></div>
                  <div class="math__key"><dt>{{ tt('pricing.receipt.target') }}</dt><dd dir="ltr">{{ money(result.target) }}</dd></div>
                  <div><dt>{{ tt('pricing.receipt.sessions') }}</dt><dd dir="ltr">{{ state.sessions }}</dd></div>
                </dl>
              </div>

              <div class="floor" aria-live="polite">
                <span class="bracket bracket--sm bracket--tl" />
                <span class="bracket bracket--sm bracket--br" />
                <span class="eyebrow" lang="en" dir="ltr">Your floor</span>
                <span class="floor__label">{{ tt('pricing.result.title') }}</span>
                <template v-if="state.sessions > 0">
                  <span class="floor__value" dir="ltr">{{ money(floorShown) }}</span>
                  <span class="floor__currency">{{ tt('pricing.currency') }}</span>
                  <span class="floor__formula">
                    {{
                      tt('pricing.result.formula', {
                        target: money(result.target),
                        sessions: state.sessions,
                        exact: money(result.exact),
                        step: money(ROUND_TO),
                      })
                    }}
                  </span>
                  <span class="floor__warn">{{ tt('pricing.result.below') }}</span>
                </template>
                <span v-else class="floor__formula">{{ tt('pricing.result.noSessions') }}</span>
              </div>
            </div>
          </div>
        </Transition>

        <div class="panel__nav">
          <button v-if="step > 0" type="button" class="btn" @click="goTo(step - 1)">
            <span class="arrow">→</span> {{ tt('pricing.back') }}
          </button>
          <span v-else />
          <button v-if="step < STEPS.length - 1" type="button" class="btn btn--solid" @click="goTo(step + 1)">
            {{ tt('pricing.next') }} <span class="arrow">←</span>
          </button>
        </div>
      </section>

      <p class="calc__rule">{{ tt('pricing.result.rule') }}</p>
    </main>

    <MiniFooter :links="footerLinks" />
  </div>
</template>

<style scoped>
.pricing {
  position: relative;
  min-height: 100vh;
}

.pricing :deep(.site-nav) {
  position: sticky;
  top: 0;
  padding-block: 22px;
  background: linear-gradient(180deg, rgba(11, 12, 14, 0.9), rgba(11, 12, 14, 0));
}

/* Arabic letters join, so tracking that suits Latin eyebrows breaks words apart. */
.calc :deep(.crumbs__list) {
  letter-spacing: 0;
}

.calc {
  max-width: var(--maxw);
  margin: 0 auto;
  padding: 0 var(--gutter) clamp(40px, 5vw, 70px);
}

.calc__head {
  padding: clamp(20px, 3vw, 40px) 0 clamp(28px, 3vw, 44px);
}

.calc__crumbs {
  margin-bottom: 22px;
}

.calc__eyebrow {
  display: block;
  text-align: right;
}

.calc__head-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 28px;
  flex-wrap: wrap;
  margin-top: 14px;
}

.calc__title {
  font-weight: 700;
  font-size: clamp(32px, 4.6vw, 64px);
  line-height: 1.15;
}

.calc__intro {
  max-width: 400px;
}

.calc__tools {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.calc__tools .btn,
.panel__nav .btn {
  letter-spacing: 0;
  font-size: 13px;
}

/* ---------- stepper ---------- */

.stepper {
  scroll-margin-top: 96px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  list-style: none;
  margin-bottom: 18px;
}

.stepper__btn {
  position: relative;
  width: 100%;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 4px 12px;
  align-items: baseline;
  padding: 16px 18px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: transparent;
  color: var(--ink);
  text-align: right;
  cursor: pointer;
  opacity: 0.55;
  transition: opacity 0.3s ease, border-color 0.3s ease, background 0.3s ease;
}

.stepper__btn:hover {
  opacity: 0.85;
}

.stepper__btn.is-done {
  opacity: 0.8;
}

.stepper__btn.is-on {
  opacity: 1;
  border-color: var(--accent);
  background: var(--panel);
}

.stepper__num {
  font-size: 11px;
  letter-spacing: 0.16em;
  color: var(--accent);
}

.stepper__label {
  font-size: 15px;
  font-weight: 500;
}

.stepper__figure {
  grid-column: 1 / -1;
  font-size: clamp(18px, 2vw, 26px);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.stepper__btn.is-on .stepper__figure {
  color: var(--accent);
}

/* ---------- panel ---------- */

.panel {
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: clamp(22px, 3.4vw, 48px);
}

.panel__head {
  margin-bottom: clamp(22px, 3vw, 36px);
}

.panel__head .eyebrow {
  display: block;
  text-align: right;
}

.panel__title {
  margin-top: 12px;
  font-weight: 700;
  font-size: clamp(24px, 3vw, 40px);
  line-height: 1.25;
}

.panel__hint {
  margin-top: 8px;
  font-size: 15px;
  font-weight: 300;
  opacity: 0.6;
}

.panel__nav {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: clamp(26px, 3vw, 40px);
  padding-top: 22px;
  border-top: 1px solid var(--line);
}

.split {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
  gap: clamp(22px, 3vw, 44px);
  align-items: start;
}

@media (max-width: 900px) {
  .split {
    grid-template-columns: 1fr;
  }
}

/* ---------- editable rows ---------- */

.rows--gear {
  --cols: minmax(0, 1.6fr) minmax(0, 1.2fr) 112px minmax(0, 0.9fr) 28px;
}

.rows--monthly {
  --cols: minmax(0, 1.6fr) minmax(0, 1fr) auto 28px;
}

.rows__head,
.rows__row {
  display: grid;
  grid-template-columns: var(--cols);
  gap: 18px;
  align-items: center;
}

.rows__head {
  padding-bottom: 10px;
  border-bottom: 1px solid var(--line);
  font-size: 13px;
  color: var(--accent);
}

.rows__row {
  padding: 6px 0;
  border-bottom: 1px solid var(--line);
}

.rows__name {
  min-width: 0;
  padding: 10px 0;
  border: none;
  border-bottom: 1px solid transparent;
  background: transparent;
  color: var(--ink);
  font-size: 15px;
  outline: none;
  transition: border-color 0.3s ease;
}

.rows__name:focus {
  border-color: var(--accent);
}

.rows__name::placeholder {
  color: rgba(242, 240, 234, 0.3);
}

.rows__out {
  font-variant-numeric: tabular-nums;
  text-align: left;
  opacity: 0.85;
}

.rows__remove {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: none;
  color: var(--ink);
  font-size: 18px;
  opacity: 0.35;
  cursor: pointer;
  transition: opacity 0.2s ease, background 0.2s ease;
}

.rows__remove:hover,
.rows__remove:focus-visible {
  opacity: 1;
  background: rgba(242, 240, 234, 0.08);
}

.rows__foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--accent);
  margin-top: -1px;
}

.rows__add {
  border: 1px dashed var(--line);
  border-radius: 100px;
  padding: 9px 18px;
  background: none;
  color: var(--ink);
  font-size: 13px;
  opacity: 0.7;
  cursor: pointer;
  transition: opacity 0.2s ease, border-color 0.2s ease;
}

.rows__add:hover {
  opacity: 1;
  border-color: var(--accent);
}

.rows__total {
  display: inline-flex;
  gap: 14px;
  color: var(--accent);
  font-size: 14px;
}

.rows__total b {
  font-variant-numeric: tabular-nums;
}

/* Phones: each row becomes a small card — name across the top, figures below. */
@media (max-width: 700px) {
  .rows__head {
    display: none;
  }

  .rows--gear .rows__row {
    grid-template-columns: minmax(0, 1fr) 112px 28px;
    gap: 6px 14px;
    padding: 12px 0;
  }

  .rows--gear .rows__name {
    grid-column: 1 / 3;
  }

  .rows--gear .rows__remove {
    grid-column: 3;
    grid-row: 1;
  }

  .rows--gear .rows__out {
    grid-column: 1 / -1;
    font-size: 13px;
    opacity: 0.55;
  }

  .rows--gear .rows__out::after {
    content: ' ' attr(data-unit);
  }

  .rows--monthly .rows__row {
    grid-template-columns: minmax(0, 1fr) auto 28px;
    gap: 6px 14px;
    padding: 12px 0;
  }

  .rows--monthly .rows__name {
    grid-column: 1 / 3;
  }
}

/* ---------- small controls ---------- */

.count {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid var(--line);
  border-radius: 100px;
  padding: 3px;
}

.count button {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 50%;
  background: none;
  color: var(--ink);
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.count button:hover {
  background: rgba(242, 240, 234, 0.08);
}

.count output {
  min-width: 2ch;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.count--lg {
  align-self: flex-start;
  min-width: 170px;
  padding: 5px;
}

.count--lg button {
  width: 40px;
  height: 40px;
  font-size: 20px;
}

.count--lg output {
  font-size: 22px;
  font-weight: 700;
}

.toggle {
  display: inline-flex;
  padding: 3px;
  border: 1px solid var(--line);
  border-radius: 100px;
}

.toggle__opt {
  padding: 6px 12px;
  border: none;
  border-radius: 100px;
  background: none;
  color: var(--ink);
  font-size: 12.5px;
  opacity: 0.5;
  cursor: pointer;
  transition: background 0.2s ease, opacity 0.2s ease, color 0.2s ease;
}

.toggle__opt.is-on {
  opacity: 1;
  background: rgba(242, 240, 234, 0.1);
}

.toggle__opt.is-on:last-child {
  background: var(--accent);
  color: var(--bg);
}

.range {
  width: 100%;
  accent-color: var(--accent);
  margin: 12px 0 4px;
}

/* ---------- summaries ---------- */

.callout {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: clamp(22px, 3vw, 34px);
  padding: clamp(18px, 2.4vw, 28px) clamp(20px, 2.6vw, 32px);
  border: 1px solid var(--accent);
  border-radius: 10px;
  background: var(--panel);
  font-size: clamp(15px, 1.6vw, 19px);
  font-weight: 500;
}

.callout strong {
  color: var(--accent);
  font-size: clamp(28px, 3.4vw, 44px);
  font-variant-numeric: tabular-nums;
}

.cards {
  display: grid;
  gap: 12px;
}

.card {
  display: grid;
  gap: 6px;
  padding: 20px 22px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--panel);
}

.card .eyebrow {
  text-align: right;
}

.card--accent {
  border-color: var(--accent);
}

.card__label {
  font-size: 14px;
  opacity: 0.6;
}

.card__value {
  font-size: clamp(24px, 2.6vw, 34px);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.card--accent .card__value {
  color: var(--accent);
}

.card__note {
  font-size: 12.5px;
  opacity: 0.5;
}

.inputs {
  display: grid;
  gap: 26px;
}

.input {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.input__label {
  display: flex;
  justify-content: space-between;
  font-size: 15px;
  font-weight: 500;
}

.input__value {
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}

.input__hint {
  font-size: 13px;
  font-weight: 300;
  opacity: 0.5;
}

.math {
  margin-top: 32px;
}

.math > div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid var(--line);
  font-size: 15px;
}

.math dd {
  font-variant-numeric: tabular-nums;
}

.math__dim dt {
  opacity: 0.55;
}

.math__key {
  border-top: 1px solid var(--accent);
  color: var(--accent);
  font-weight: 700;
}

.floor {
  position: sticky;
  top: 110px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: clamp(28px, 3.4vw, 44px);
  border: 1px solid var(--accent);
  border-radius: 12px;
  background: var(--panel);
}

.floor .eyebrow {
  text-align: right;
}

.floor__label {
  font-size: clamp(17px, 1.8vw, 22px);
  font-weight: 500;
}

.floor__value {
  margin-top: 10px;
  font-size: clamp(48px, 7vw, 96px);
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.03em;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.floor__currency {
  font-size: 14px;
  opacity: 0.6;
}

.floor__formula {
  margin-top: 14px;
  font-size: 13.5px;
  line-height: 1.7;
  opacity: 0.6;
}

.floor__warn {
  font-size: 13px;
  color: var(--accent);
  opacity: 0.85;
}

.calc__rule {
  margin-top: clamp(28px, 3vw, 44px);
  text-align: center;
  font-size: clamp(16px, 1.8vw, 21px);
  font-weight: 500;
  opacity: 0.75;
}

/* ---------- motion ---------- */

.step-enter-active,
.step-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}

.step-enter-from {
  opacity: 0;
  transform: translateY(14px);
}

.step-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.row-enter-active,
.row-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.row-enter-from,
.row-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}

@media (max-width: 640px) {
  .stepper {
    gap: 6px;
  }

  .stepper__btn {
    padding: 12px;
  }

  .stepper__label {
    font-size: 13px;
  }

  .stepper__figure {
    font-size: 15px;
  }

  .floor {
    position: static;
  }
}
</style>
