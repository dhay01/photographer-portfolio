<script setup>
import { ref } from 'vue'
import SiteNav from '../components/SiteNav.vue'
import SiteFooter from '../components/SiteFooter.vue'
import ImageSlot from '../components/ImageSlot.vue'
import { useSiteMotion } from '../composables/useSiteMotion'
import { getAbout, getPage } from '../lib/api'
import { useContent } from '../composables/useContent'

const root = ref(null)
useSiteMotion(root)

const { data: page } = useContent(getPage.bind(null, 'about'))
const { data: about, pending, error } = useContent(getAbout)

// The intro is the only field that needs inline emphasis. Escaping first keeps
// dashboard input from injecting markup beyond the <strong> we add ourselves.
const emphasise = (text) => {
  if (!text) return ''

  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  return escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
}
</script>

<template>
  <div ref="root" class="about">
    <SiteNav absolute />

    <p v-if="error" class="about__state mono">{{ error }}</p>

    <!-- HERO -->
    <section class="hero">
      <div class="shell">
        <span data-reveal class="eyebrow">{{ page?.eyebrow }}</span>
        <h1 data-reveal class="hero__title">
          {{ about?.hero_title }}<span class="hero__mark">&reg;</span>
        </h1>
      </div>

      <div class="hero__split">
        <div data-reveal class="hero__media">
          <div class="hero__media-img">
            <ImageSlot
              :src="about?.hero_image?.preview"
              :alt="about?.hero_title"
              placeholder="photographer at work · 16:10"
            />
          </div>
          <div class="hero__media-scrim" />
          <div data-bracket class="bracket bracket--sm hero__bracket-tl" />
          <div data-bracket class="bracket bracket--sm hero__bracket-br" />
          <span data-cross class="hero__cross mono">+</span>
        </div>

        <div data-reveal>
          <!-- Authored in the dashboard; **bold** is the only markup honoured. -->
          <p class="hero__intro" v-html="emphasise(about?.hero_intro)" />
          <div class="chips">
            <span v-for="d in about?.disciplines ?? []" :key="d" class="chip mono">{{ d }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- JOURNEY -->
    <section class="section section--rule journey">
      <div class="journey__grid">
        <div>
          <div data-fade class="journey__sticky">
            <span class="eyebrow">{{ $t('about.journey') }}</span>
            <h2 class="journey__title">{{ about?.journey_title }}</h2>
          </div>
        </div>

        <div data-fade class="journey__prose">
          <p v-for="(para, i) in about?.journey_paragraphs ?? []" :key="i">{{ para }}</p>

          <div class="timeline">
            <div v-for="entry in about?.timeline ?? []" :key="entry.year" class="timeline__row">
              <span class="mono timeline__year">{{ entry.year }}</span>
              <span class="timeline__what">{{ entry.what }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- PHILOSOPHY -->
    <section class="section section--rule philosophy">
      <span data-fade class="eyebrow">{{ $t('about.philosophy') }}</span>
      <blockquote data-fade class="philosophy__quote">{{ about?.philosophy_quote }}</blockquote>
      <p data-fade class="philosophy__note">{{ about?.philosophy_note }}</p>
    </section>

    <!-- APPROACH -->
    <section class="section section--rule">
      <div class="shell">
        <span data-fade class="eyebrow">{{ $t('about.approach') }}</span>
        <div class="approach">
          <div v-for="step in about?.approach ?? []" :key="step.n" data-fade>
            <div class="mono approach__n">{{ step.n }}</div>
            <h3 class="approach__title">{{ step.title }}</h3>
            <p class="approach__body">{{ step.body }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- GEAR -->
    <section class="section section--rule">
      <div class="gear">
        <div data-fade>
          <span class="eyebrow">{{ $t('about.gear') }}</span>
          <h2 class="gear__title">{{ about?.gear_title }}</h2>

          <dl class="gear__list">
            <div v-for="item in about?.gear ?? []" :key="item.label">
              <dt class="mono">{{ item.label }}</dt>
              <dd>{{ item.value }}</dd>
            </div>
          </dl>
        </div>

        <div data-fade class="gear__media">
          <ImageSlot
            :src="about?.gear_image?.preview"
            :alt="about?.gear_title"
            placeholder="studio / gear still life · 4:5"
          />
          <div data-bracket class="bracket bracket--sm bracket--tr" />
        </div>
      </div>
    </section>

    <SiteFooter />
  </div>
</template>

<style scoped>
.about__state {
  padding: 120px var(--gutter);
  text-align: center;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(242, 240, 234, 0.5);
}

.about {
  position: relative;
  min-height: 100vh;
}

/* ---------- hero ---------- */

.hero {
  position: relative;
  padding: clamp(140px, 18vh, 220px) var(--gutter) clamp(50px, 7vw, 90px);
}

.hero__title {
  margin-top: 22px;
  font-weight: 700;
  font-size: clamp(52px, 11vw, 178px);
  line-height: 0.86;
  letter-spacing: -0.045em;
  text-transform: lowercase;
}

.hero__mark {
  font-size: 0.2em;
  vertical-align: top;
  display: inline-block;
  transform: translateY(0.5em);
  margin-left: 0.1em;
  font-weight: 400;
}

.hero__split {
  max-width: var(--maxw);
  margin: clamp(48px, 6vw, 86px) auto 0;
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: clamp(36px, 6vw, 90px);
  align-items: end;
}

@media (max-width: 900px) {
  .hero__split {
    grid-template-columns: 1fr;
    align-items: stretch;
  }
}

.hero__media {
  position: relative;
  aspect-ratio: 16 / 10;
  border-radius: 8px;
  overflow: hidden;
}

.hero__media-img {
  position: absolute;
  inset: 0;
  animation: gs-kb-about 10s ease-in-out infinite alternate;
}

@keyframes gs-kb-about {
  0% {
    transform: scale(1.04);
  }
  100% {
    transform: scale(1.12);
  }
}

.hero__media-scrim {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(11, 12, 14, 0.15), rgba(11, 12, 14, 0.35));
}

.hero__bracket-tl {
  top: 18px;
  left: 18px;
  width: 34px;
  height: 34px;
  border-top: 1.5px solid var(--accent);
  border-left: 1.5px solid var(--accent);
}

.hero__bracket-br {
  bottom: 18px;
  right: 18px;
  width: 34px;
  height: 34px;
  border-bottom: 1.5px solid var(--accent);
  border-right: 1.5px solid var(--accent);
}

.hero__cross {
  position: absolute;
  top: 30%;
  right: 22%;
  font-size: 20px;
  opacity: 0.5;
  pointer-events: none;
}

.hero__intro {
  font-size: clamp(18px, 1.9vw, 26px);
  line-height: 1.45;
  font-weight: 300;
  letter-spacing: -0.01em;
  text-wrap: pretty;
}

.hero__intro strong {
  font-weight: 500;
}

.chips {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 28px;
}

.chip {
  font-size: 10.5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 8px 14px;
  border: 1px solid var(--line);
  border-radius: 100px;
  opacity: 0.8;
}

/* ---------- journey ---------- */

.journey__grid {
  max-width: var(--maxw);
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 0.42fr) minmax(0, 1fr);
  gap: clamp(36px, 6vw, 110px);
}

@media (max-width: 900px) {
  .journey__grid {
    grid-template-columns: 1fr;
  }
}

.journey__sticky {
  position: sticky;
  top: 60px;
}

.journey__title {
  margin-top: 20px;
  font-weight: 400;
  font-size: clamp(28px, 3.4vw, 48px);
  line-height: 1.05;
  letter-spacing: -0.025em;
}

.journey__prose {
  font-size: clamp(16px, 1.25vw, 19px);
  line-height: 1.75;
  font-weight: 300;
  opacity: 0.82;
  text-wrap: pretty;
  max-width: 640px;
}

.journey__prose p + p {
  margin-top: 22px;
}

.timeline {
  margin-top: 44px;
  border-top: 1px solid var(--line);
}

.timeline__row {
  display: flex;
  gap: 24px;
  padding: 18px 0;
  border-bottom: 1px solid var(--line);
}

.timeline__row:last-child {
  border-bottom: none;
}

.timeline__year {
  font-size: 12px;
  opacity: 0.55;
  width: 56px;
  flex: none;
}

.timeline__what {
  font-size: 15px;
  opacity: 0.85;
}

/* ---------- philosophy ---------- */

.philosophy {
  padding-block: clamp(70px, 10vw, 150px);
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.philosophy__quote {
  margin-top: 30px;
  font-weight: 300;
  font-size: clamp(26px, 4.4vw, 64px);
  line-height: 1.12;
  letter-spacing: -0.03em;
  text-wrap: pretty;
}

.philosophy__quote span {
  opacity: 0.5;
}

.philosophy__note {
  margin: 34px auto 0;
  max-width: 560px;
  font-size: 16px;
  line-height: 1.7;
  font-weight: 300;
  opacity: 0.7;
  text-wrap: pretty;
}

/* ---------- approach ---------- */

.approach {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: clamp(20px, 3vw, 48px);
  margin-top: clamp(36px, 4vw, 58px);
}

@media (max-width: 860px) {
  .approach {
    grid-template-columns: 1fr;
  }
}

.approach__n {
  font-size: 13px;
  opacity: 0.5;
}

.approach__title {
  margin-top: 16px;
  font-weight: 500;
  font-size: clamp(22px, 2vw, 30px);
  letter-spacing: -0.02em;
}

.approach__body {
  margin-top: 14px;
  font-size: 15px;
  line-height: 1.7;
  font-weight: 300;
  opacity: 0.72;
  text-wrap: pretty;
}

/* ---------- gear ---------- */

.gear {
  max-width: var(--maxw);
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 0.9fr);
  gap: clamp(36px, 6vw, 90px);
  align-items: center;
}

@media (max-width: 900px) {
  .gear {
    grid-template-columns: 1fr;
  }
}

.gear__title {
  margin-top: 20px;
  font-weight: 400;
  font-size: clamp(26px, 3vw, 42px);
  line-height: 1.1;
  letter-spacing: -0.025em;
  text-wrap: pretty;
}

.gear__list {
  margin-top: 40px;
  border-top: 1px solid var(--line);
}

.gear__list > div {
  display: grid;
  grid-template-columns: 130px 1fr;
  gap: 20px;
  padding: 18px 0;
  border-bottom: 1px solid var(--line);
}

.gear__list > div:last-child {
  border-bottom: none;
}

.gear__list dt {
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.55;
}

.gear__list dd {
  font-size: 15px;
  opacity: 0.88;
}

.gear__media {
  position: relative;
  aspect-ratio: 4 / 5;
  border-radius: 8px;
  overflow: hidden;
}
</style>
