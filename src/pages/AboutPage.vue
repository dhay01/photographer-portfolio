<script setup>
import { ref } from 'vue'
import SiteNav from '../components/SiteNav.vue'
import SiteFooter from '../components/SiteFooter.vue'
import ImageSlot from '../components/ImageSlot.vue'
import { useSiteMotion } from '../composables/useSiteMotion'
import { photos } from '../data/photos'

const root = ref(null)
useSiteMotion(root)

const disciplines = ['Landscape', 'Panorama', 'Gigapixel']

const timeline = [
  { year: '2013', what: 'First steps into professional landscape photography.' },
  { year: '2018', what: 'Began teaching workshops on the ground.' },
  { year: '2020', what: 'Trained thousands of photographers online.' },
  { year: '2026', what: 'Annual month-long training camp in Baghdad.' },
]

const approach = [
  {
    n: '01',
    title: 'Observe',
    body: 'Before the camera comes up, I watch. Every subject has a rhythm — the way they move, pause, and forget I’m there. I wait for that.',
  },
  {
    n: '02',
    title: 'Wait',
    body: 'Light is the one collaborator I can’t rush. I’d rather lose the shot than fake the moment. The best frames arrive when you stop chasing them.',
  },
  {
    n: '03',
    title: 'Honor',
    body: 'In edit, I protect what was real. Grain over gloss, texture over perfection. The goal is never to improve the moment — only to keep it.',
  },
]

const gear = [
  { label: 'Cameras', value: 'Sigma BF (Sony E-mount)' },
  { label: 'Lenses', value: 'Sigma 14mm f/1.8 · 70-200mm f/2.8 · 105mm Macro' },
  { label: 'Lighting', value: 'Natural light · golden hour, mostly' },
  { label: 'Formats', value: 'Panorama · Gigapixel · Landscape' },
  { label: 'Studio', value: 'Baghdad, Iraq — shooting worldwide' },
]
</script>

<template>
  <div ref="root" class="about">
    <SiteNav absolute />

    <!-- HERO -->
    <section class="hero">
      <div class="shell">
        <span data-reveal class="eyebrow">(00) &mdash; About</span>
        <h1 data-reveal class="hero__title">
          the person<br />behind the lens<span class="hero__mark">&reg;</span>
        </h1>
      </div>

      <div class="hero__split">
        <div data-reveal class="hero__media">
          <div class="hero__media-img">
            <ImageSlot
              :src="photos.assignment"
              alt="Ghaith Salih at work"
              placeholder="photographer at work · 16:10"
            />
          </div>
          <div class="hero__media-scrim" />
          <div data-bracket class="bracket bracket--sm hero__bracket-tl" />
          <div data-bracket class="bracket bracket--sm hero__bracket-br" />
          <span data-cross class="hero__cross mono">+</span>
        </div>

        <div data-reveal>
          <p class="hero__intro">
            I&rsquo;m <strong>Ghaith Salih</strong> &mdash; a landscape, panorama &amp; gigapixel
            photographer based in Baghdad, with 12+ years chasing wide, honest light.
          </p>
          <div class="chips">
            <span v-for="d in disciplines" :key="d" class="chip mono">{{ d }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- JOURNEY -->
    <section class="section section--rule journey">
      <div class="journey__grid">
        <div>
          <div data-fade class="journey__sticky">
            <span class="eyebrow">(01) &mdash; The journey</span>
            <h2 class="journey__title">From a borrowed camera to a life in light.</h2>
          </div>
        </div>

        <div data-fade class="journey__prose">
          <p>
            It started with a borrowed camera and a country full of horizon. I studied Film
            Directing at the College of Fine Arts &mdash; but it was the still frame, not the moving
            one, that held me.
          </p>
          <p>
            Over twelve years I turned toward the land: wide panoramas and gigapixel frames stitched
            from hundreds of exposures, each one a patient argument for slowing down. I&rsquo;ve held
            5 solo exhibitions, shown in many group shows, and collected awards along the way.
          </p>
          <p>
            Teaching came next. For seven years I&rsquo;ve trained hundreds of photographers on the
            ground and thousands online &mdash; including a Sony workshop on video, held with the
            Arab Photographers Union. Today more than 52,000 people follow the work on Instagram.
          </p>

          <div class="timeline">
            <div v-for="entry in timeline" :key="entry.year" class="timeline__row">
              <span class="mono timeline__year">{{ entry.year }}</span>
              <span class="timeline__what">{{ entry.what }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- PHILOSOPHY -->
    <section class="section section--rule philosophy">
      <span data-fade class="eyebrow">(02) &mdash; Philosophy</span>
      <blockquote data-fade class="philosophy__quote">
        I don&rsquo;t photograph how things look. <span>I photograph</span> what light forgets to
        say.
      </blockquote>
      <p data-fade class="philosophy__note">
        A photograph should feel like a memory you didn&rsquo;t know you had. I work slow and quiet,
        keeping the frame honest &mdash; no forced smiles, no over-direction. Just presence,
        patience, and the right light.
      </p>
    </section>

    <!-- APPROACH -->
    <section class="section section--rule">
      <div class="shell">
        <span data-fade class="eyebrow">(03) &mdash; Approach to the craft</span>
        <div class="approach">
          <div v-for="step in approach" :key="step.n" data-fade>
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
          <span class="eyebrow">(04) &mdash; Gear &amp; studio</span>
          <h2 class="gear__title">
            Simple tools, used well. The camera is never the point &mdash; but people always ask.
          </h2>

          <dl class="gear__list">
            <div v-for="item in gear" :key="item.label">
              <dt class="mono">{{ item.label }}</dt>
              <dd>{{ item.value }}</dd>
            </div>
          </dl>
        </div>

        <div data-fade class="gear__media">
          <ImageSlot
            :src="photos.stars"
            alt="Studio and gear"
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
