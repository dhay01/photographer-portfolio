<script setup>
import { ref, computed, reactive, watch } from 'vue'
import SiteNav from '../components/SiteNav.vue'
import ImageSlot from '../components/ImageSlot.vue'
import ReserveModal from '../components/ReserveModal.vue'
import { useSiteMotion } from '../composables/useSiteMotion'
import { getPage, getWorkshops } from '../lib/api'
import { useContent } from '../composables/useContent'
import { dateParts, monthName, price, shortDate, workshopDates } from '../lib/format'

const root = ref(null)
useSiteMotion(root)

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const { data: page } = useContent(getPage.bind(null, 'courses'))
const { data: allWorkshops } = useContent(getWorkshops, { initial: [] })

// One request returns the whole schedule; the archive is simply everything the
// API already flagged as past.
const workshops = computed(() => (allWorkshops.value ?? []).filter((w) => !w.is_past))
const pastWorkshops = computed(() => (allWorkshops.value ?? []).filter((w) => w.is_past))

const today = new Date()
const year = ref(today.getFullYear())
const month = ref(today.getMonth())
const selectedSlug = ref(null)
const reserved = reactive({})

const reserveOpen = ref(false)

const selected = computed(
  () => workshops.value.find((w) => w.slug === selectedSlug.value) ?? workshops.value[0] ?? null,
)
const monthLabel = computed(() => `${monthName(month.value, year.value)} ${year.value}`)

// Jump the calendar to the first upcoming workshop once the schedule arrives.
watch(workshops, (list) => {
  if (selectedSlug.value || !list.length) return

  selectedSlug.value = list[0].slug
  const { year: y, month: m } = dateParts(list[0].starts_on)
  year.value = y
  month.value = m
})

const cells = computed(() => {
  const byDay = {}
  workshops.value.forEach((w) => {
    const { year: y, month: m, day } = dateParts(w.starts_on)
    if (y === year.value && m === month.value) byDay[day] = w
  })

  const firstWeekday = new Date(year.value, month.value, 1).getDay()
  const daysInMonth = new Date(year.value, month.value + 1, 0).getDate()

  return Array.from({ length: 42 }, (_, i) => {
    const day = i - firstWeekday + 1
    const inMonth = day >= 1 && day <= daysInMonth
    const workshop = inMonth ? byDay[day] : null
    return {
      key: i,
      label: inMonth ? String(day) : '',
      inMonth,
      workshop,
      selected: !!workshop && workshop.slug === selectedSlug.value,
    }
  })
})

const shiftMonth = (delta) => {
  let m = month.value + delta
  let y = year.value
  if (m < 0) {
    m = 11
    y--
  } else if (m > 11) {
    m = 0
    y++
  }
  month.value = m
  year.value = y
}

const select = (slug) => {
  const w = workshops.value.find((x) => x.slug === slug)
  if (!w) return

  selectedSlug.value = slug
  const { year: y, month: m } = dateParts(w.starts_on)
  year.value = y
  month.value = m
}

const openReserve = () => (reserveOpen.value = true)
const closeReserve = () => (reserveOpen.value = false)
const onReserved = () => (reserved[selectedSlug.value] = true)
</script>

<template>
  <div ref="root" class="courses">
    <SiteNav />

    <header class="courses__head">
      <span class="eyebrow">{{ page?.eyebrow }}</span>
      <div class="courses__head-row">
        <h1 class="courses__title" style="white-space: pre-line">{{ page?.title }}</h1>
        <p class="lede courses__intro">{{ page?.intro }}</p>
      </div>
    </header>

    <!-- CALENDAR + DETAIL -->
    <section class="planner">
      <div data-fade class="calendar">
        <div class="calendar__bar">
          <div class="calendar__month">{{ monthLabel }}</div>
          <div class="calendar__nav">
            <button aria-label="Previous month" @click="shiftMonth(-1)">&larr;</button>
            <button aria-label="Next month" @click="shiftMonth(1)">&rarr;</button>
          </div>
        </div>

        <div class="calendar__weekdays">
          <div v-for="w in WEEKDAYS" :key="w" class="mono">{{ w }}</div>
        </div>

        <div class="calendar__grid">
          <button
            v-for="cell in cells"
            :key="cell.key"
            class="cell mono"
            :disabled="!cell.workshop"
            :aria-label="cell.workshop ? `${cell.workshop.title} on ${cell.label}` : undefined"
            @click="cell.workshop && select(cell.workshop.slug)"
          >
            <span v-if="cell.workshop && !cell.selected" class="cell__ring" />
            <span v-if="cell.selected" class="cell__fill" />
            <span class="cell__label" :class="{ 'cell__label--on': cell.selected }">
              {{ cell.label }}
            </span>
            <span v-if="cell.workshop && !cell.selected" class="cell__dot" />
          </button>
        </div>

        <div class="legend mono">
          <span><span class="legend__ring" />Workshop day</span>
          <span><span class="legend__fill" />Selected</span>
        </div>
      </div>

      <div data-fade class="detail">
        <template v-if="selected">
          <div class="mono detail__mode">{{ selected.mode }}</div>
          <h2 class="detail__title">{{ selected.title }}</h2>

          <dl class="detail__facts">
            <div>
              <dt class="mono">{{ $t('courses.dates') }}</dt>
              <dd>{{ workshopDates(selected) }}</dd>
            </div>
            <div>
              <dt class="mono">{{ $t('courses.location') }}</dt>
              <dd>{{ selected.location }}</dd>
            </div>
            <div>
              <dt class="mono">{{ $t('courses.level') }}</dt>
              <dd>{{ selected.level }}</dd>
            </div>
            <div>
              <dt class="mono">{{ $t('courses.seats') }}</dt>
              <dd>{{ $t('courses.seatsLeftCount', { count: selected.seats_left }) }}</dd>
            </div>
          </dl>

          <div class="detail__foot">
            <div class="detail__price-col">
              <div>
                <span class="detail__price">{{ price(selected) }}</span>
                <span class="mono detail__per">per seat</span>
              </div>
              <RouterLink :to="`/courses/${selected.slug}`" class="mono detail__more">
                Full details &rarr;
              </RouterLink>
            </div>

            <span v-if="reserved[selected.slug]" class="mono detail__reserved">
              Reserved &#10003;
            </span>
            <button v-else class="btn btn--solid" @click="openReserve">Reserve a seat</button>
          </div>
        </template>

        <div v-else class="mono detail__empty">
          Select a highlighted date to see workshop details.
        </div>
      </div>
    </section>

    <!-- UPCOMING -->
    <section class="upcoming">
      <div class="rule-head">
        <span class="mono rule-head__label">All upcoming</span>
      </div>

      <button
        v-for="w in workshops"
        :key="w.slug"
        data-course
        class="row"
        @click="select(w.slug)"
      >
        <span class="mono row__date">{{ shortDate(w) }}</span>
        <span>
          <span class="row__title">{{ w.title }}</span>
          <span class="mono row__mode">{{ w.mode }}</span>
        </span>
        <span class="mono row__loc">{{ w.location }}</span>
        <span class="mono row__seats">
          {{ reserved[w.slug] ? $t('courses.reserved') : $t('courses.seatsShort', { count: w.seats_left }) }}
        </span>
        <span class="row__price">{{ price(w) }}</span>
        <span class="row__arrow">&rarr;</span>
      </button>
    </section>

    <!-- PAST -->
    <section class="past">
      <div class="rule-head rule-head--split">
        <span class="mono rule-head__label">{{ $t('courses.past') }}</span>
        <span class="mono rule-head__aside">Archive</span>
      </div>

      <div class="past__grid">
        <article v-for="w in pastWorkshops" :key="w.slug" data-fade class="past-card">
          <div class="past-card__media">
            <div class="past-card__img">
              <ImageSlot :src="w.images?.thumb" :alt="w.title" :placeholder="w.title" />
            </div>
            <div class="mono past-card__flag">Completed</div>
          </div>
          <div class="mono past-card__meta">
            <span class="past-card__date">{{ shortDate(w) }}</span>
            <span class="past-card__dot" />
            <span>{{ w.location }}</span>
          </div>
          <h3 class="past-card__title">{{ w.title }}</h3>
          <div class="mono past-card__attendees">{{ w.attendees }}</div>
        </article>
      </div>
    </section>

    <ReserveModal
      v-if="reserveOpen && selected"
      :course="selected"
      @close="closeReserve"
      @reserved="onReserved"
    />
  </div>
</template>

<style scoped>
.courses {
  position: relative;
  min-height: 100vh;
}

.courses :deep(.site-nav) {
  position: sticky;
  top: 0;
  padding-block: 22px;
  background: linear-gradient(180deg, rgba(11, 12, 14, 0.9), rgba(11, 12, 14, 0));
}

.courses__head {
  padding: clamp(20px, 3vw, 40px) var(--gutter) clamp(20px, 2.5vw, 32px);
}

.courses__head-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.courses__title {
  font-weight: 700;
  font-size: clamp(34px, 5vw, 72px);
  line-height: 0.92;
  letter-spacing: -0.035em;
  text-transform: lowercase;
}

.courses__intro {
  max-width: 360px;
}

/* ---------- planner ---------- */

.planner {
  padding: 0 var(--gutter) clamp(40px, 5vw, 64px);
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  gap: clamp(28px, 4vw, 64px);
  align-items: start;
  border-top: 1px solid var(--line);
  padding-top: clamp(28px, 3vw, 44px);
}

@media (max-width: 900px) {
  .planner {
    grid-template-columns: 1fr;
  }
}

.calendar__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22px;
}

.calendar__month {
  font-size: clamp(20px, 2vw, 28px);
  font-weight: 500;
  letter-spacing: -0.01em;
}

.calendar__nav {
  display: flex;
  gap: 10px;
}

.calendar__nav button {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--ink);
  cursor: pointer;
  font-size: 16px;
  transition: border-color 0.3s ease, background 0.3s ease;
}

.calendar__nav button:hover {
  border-color: var(--line-strong);
  background: rgba(242, 240, 234, 0.06);
}

.calendar__weekdays,
.calendar__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar__weekdays {
  margin-bottom: 8px;
}

.calendar__weekdays div {
  text-align: center;
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.4;
  padding: 6px 0;
}

.cell {
  position: relative;
  aspect-ratio: 1 / 1;
  border: none;
  background: transparent;
  color: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-family: var(--font-mono);
  font-size: 13px;
  cursor: pointer;
}

.cell:disabled {
  cursor: default;
}

.cell__ring {
  position: absolute;
  inset: 3px;
  border: 1px solid rgba(246, 139, 43, 0.45);
  border-radius: 8px;
}

.cell__fill {
  position: absolute;
  inset: 3px;
  background: var(--accent);
  border-radius: 8px;
}

.cell__label {
  position: relative;
  z-index: 2;
  opacity: 0.9;
}

.cell:disabled .cell__label {
  opacity: 0.35;
}

.cell__label--on {
  color: var(--bg);
  font-weight: 700;
  opacity: 1;
}

.cell__dot {
  position: absolute;
  bottom: 7px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--accent);
}

.legend {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-top: 20px;
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.5;
}

.legend span {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.legend__ring {
  width: 9px;
  height: 9px;
  border: 1px solid rgba(246, 139, 43, 0.6);
  border-radius: 3px;
}

.legend__fill {
  width: 9px;
  height: 9px;
  background: var(--accent);
  border-radius: 3px;
}

/* ---------- detail panel ---------- */

.detail {
  position: sticky;
  top: 90px;
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: clamp(22px, 2.4vw, 34px);
  background: rgba(20, 21, 24, 0.4);
}

.detail__mode {
  font-size: 10.5px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--accent);
}

.detail__title {
  margin-top: 14px;
  font-weight: 500;
  font-size: clamp(24px, 2.6vw, 36px);
  line-height: 1.08;
  letter-spacing: -0.02em;
  text-wrap: pretty;
}

.detail__facts {
  margin-top: 22px;
  border-top: 1px solid var(--line);
}

.detail__facts > div {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid var(--line);
}

.detail__facts > div:last-child {
  border-bottom: none;
}

.detail__facts dt {
  font-size: 10.5px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.5;
}

.detail__facts dd {
  font-size: 15px;
}

.detail__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 22px;
  padding-top: 22px;
  border-top: 1px solid var(--line);
  flex-wrap: wrap;
}

.detail__price-col {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail__price {
  font-size: clamp(26px, 3vw, 38px);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.detail__per {
  font-size: 11px;
  opacity: 0.5;
  margin-left: 8px;
}

.detail__more {
  font-size: 10.5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--accent);
}

.detail__reserved {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 14px 26px;
  border: 1px solid var(--accent);
  border-radius: 100px;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--accent);
}

.detail__empty {
  padding: 30px 0;
  text-align: center;
  font-size: 12px;
  letter-spacing: 0.06em;
  opacity: 0.5;
}

/* ---------- upcoming rows ---------- */

.upcoming {
  padding: clamp(30px, 4vw, 50px) var(--gutter) clamp(60px, 8vw, 110px);
}

.rule-head {
  border-top: 1px solid var(--line);
  padding-top: 24px;
  margin-bottom: 8px;
}

.rule-head--split {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: clamp(24px, 3vw, 40px);
}

.rule-head__label {
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  opacity: 0.55;
}

.rule-head__aside {
  font-size: 11px;
  letter-spacing: 0.1em;
  opacity: 0.4;
}

.row {
  width: 100%;
  text-align: left;
  display: grid;
  grid-template-columns: 96px minmax(0, 1.6fr) minmax(0, 1fr) 120px 96px 40px;
  align-items: center;
  gap: 20px;
  padding: clamp(20px, 2.2vw, 30px) 8px;
  border: none;
  border-bottom: 1px solid var(--line);
  background: transparent;
  color: inherit;
  cursor: pointer;
  transition: padding-left 0.4s ease, background 0.4s ease;
}

.row:hover {
  background: rgba(246, 139, 43, 0.05);
  padding-left: 18px;
}

.row__date {
  font-size: 12px;
  color: var(--accent);
}

.row__title {
  font-size: clamp(19px, 1.9vw, 26px);
  font-weight: 500;
  letter-spacing: -0.01em;
}

.row__mode {
  display: block;
  font-size: 11px;
  opacity: 0.5;
  margin-top: 6px;
}

.row__loc {
  font-size: 12px;
  opacity: 0.7;
}

.row__seats {
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.55;
}

.row__price {
  font-size: 16px;
  font-weight: 500;
}

.row__arrow {
  font-size: 16px;
  text-align: right;
  opacity: 0.7;
}

@media (max-width: 900px) {
  .row {
    grid-template-columns: 80px 1fr auto;
    row-gap: 8px;
  }

  .row__loc,
  .row__seats {
    grid-column: 2;
  }

  .row__price {
    grid-column: 3;
    grid-row: 1;
  }

  .row__arrow {
    display: none;
  }
}

/* ---------- past ---------- */

.past {
  padding: clamp(20px, 3vw, 40px) var(--gutter) clamp(60px, 8vw, 110px);
}

.past__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: clamp(20px, 2.5vw, 36px);
}

.past-card__media {
  position: relative;
  aspect-ratio: 3 / 2;
  border-radius: 8px;
  overflow: hidden;
}

.past-card__img {
  position: absolute;
  inset: 0;
  filter: grayscale(1);
  opacity: 0.72;
  transition: filter 0.6s ease, opacity 0.6s ease, transform 1.1s cubic-bezier(0.2, 0, 0.1, 1);
}

.past-card:hover .past-card__img {
  filter: grayscale(0);
  opacity: 1;
  transform: scale(1.05);
}

.past-card__flag {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 6px 12px;
  border-radius: 100px;
  background: rgba(11, 12, 14, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid var(--line);
  font-size: 9.5px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.85;
}

.past-card__meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 14px;
  font-size: 10.5px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.6;
}

.past-card__date {
  color: var(--accent);
}

.past-card__dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.5;
}

.past-card__title {
  margin-top: 10px;
  font-weight: 500;
  font-size: clamp(18px, 1.7vw, 23px);
  line-height: 1.2;
  letter-spacing: -0.015em;
  text-wrap: pretty;
}

.past-card__attendees {
  margin-top: 10px;
  font-size: 11px;
  opacity: 0.5;
}

</style>
