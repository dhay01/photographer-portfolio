<script setup>
import { computed, ref } from 'vue'
import SiteNav from '../components/SiteNav.vue'
import SiteFooter from '../components/SiteFooter.vue'
import HeroCarousel from '../components/HeroCarousel.vue'
import ImageSlot from '../components/ImageSlot.vue'
import { useSiteMotion } from '../composables/useSiteMotion'
import { getCategories, getHeroSlides, getPage, getWorkshops } from '../lib/api'
import { useContent } from '../composables/useContent'
import { useSite } from '../composables/useSite'

const root = ref(null)
useSiteMotion(root)

const { site } = useSite()
const { data: page } = useContent(getPage.bind(null, 'home'))
const { data: slides } = useContent(getHeroSlides, { initial: [] })
const { data: workshops } = useContent(getWorkshops, { initial: [] })
const { data: galleries } = useContent(() => getCategories('work'), { initial: [] })

// Named blocks from the dashboard; `section('shop')` is undefined-safe so a
// section that has not been filled in yet simply renders empty.
const section = (key) => page.value?.sections?.[key] ?? {}
const items = (key) => section(key).items ?? []

// The home page shows the first four categories that opted into the showcase.
const featuredGalleries = computed(() =>
  (galleries.value ?? []).filter((c) => c.grid_span).slice(0, 4),
)

const heroSlides = computed(() =>
  (slides.value ?? []).map((slide) => ({ src: slide.images?.preview, alt: slide.alt })),
)

const emphasise = (text) => {
  if (!text) return ''

  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  return escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
}

const metaLines = computed(() => (section('meta').body ?? '').split('\n').filter(Boolean))

const notified = ref(false)
const email = ref('')

const onNotify = () => {
  notified.value = true
  email.value = ''
}
</script>

<template>
  <div ref="root" class="home">
    <SiteNav absolute />

    <!-- HERO -->
    <section class="hero">
      <div class="hero__stage">
        <HeroCarousel :slides="heroSlides">
          <div class="hero__headline">
            <h1 data-reveal>
              {{ site?.name }}<span class="hero__mark">&reg;</span>
            </h1>
            <p data-reveal class="hero__tagline">{{ site?.tagline }}</p>
          </div>

          <div data-reveal class="hero__micro">
            <template v-for="(line, i) in metaLines" :key="i">
              <template v-if="i">
                <br />
              </template>
              {{ line }}
            </template>
          </div>

          <div data-reveal class="hero__intro">
            <p>
              <span class="hero__dash">&mdash;&nbsp;</span><span v-html="emphasise(page?.intro)" />
            </p>
            <RouterLink to="/work" class="btn btn--sm">
              {{ $t('home.viewWork') }} <span class="arrow">&rarr;</span>
            </RouterLink>
          </div>
        </HeroCarousel>
      </div>
    </section>

    <!-- TRUSTED BY -->
    <section class="clients">
      <div class="clients__marquee-wrap">
        <div class="clients__marquee">
          <span v-for="(client, i) in [...items('clients'), ...items('clients')]" :key="i">
            {{ client.label }}
          </span>
        </div>
      </div>
      <div class="clients__rating">
        <div class="mono clients__stars">
          <span>&#9733;&#9733;&#9733;&#9733;&#9733;</span>&nbsp;&nbsp;4.9/5
        </div>
        <div class="mono clients__note">{{ section('clients').note }}</div>
      </div>
    </section>

    <!-- ABOUT -->
    <section id="about" class="about">
      <div class="about__grid">
        <div data-fade class="about__portrait">
          <ImageSlot
            :src="site?.author?.images?.preview"
            :alt="site?.author?.name"
            fit="cover"
          />
          <div data-bracket class="bracket bracket--sm bracket--tl" />
          <div data-bracket class="bracket bracket--sm bracket--br" />
        </div>

        <div data-fade>
          <span class="eyebrow">{{ section('about').eyebrow }}</span>
          <!-- Heading allows <em> for the accent style; authored in the dashboard. -->
          <h2 class="about__lead" v-html="section('about').heading" />
          <p class="body-copy about__copy">{{ section('about').body }}</p>

          <div class="stats">
            <div v-for="stat in items('stats')" :key="stat.value">
              <div class="stats__value">{{ stat.value }}</div>
              <div class="stats__label mono">{{ stat.label }}</div>
            </div>
          </div>

          <RouterLink to="/about" class="btn about__cta">
            {{ $t('home.readStory') }} <span class="arrow">&rarr;</span>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- FEATURED GALLERIES -->
    <section id="work" class="galleries">
      <div class="shell">
        <div class="section-head">
          <div>
            <span class="eyebrow">(02) &mdash; Selected work</span>
            <h2 class="display">{{ section('work').heading }}</h2>
          </div>
          <RouterLink to="/work" class="link-mono">
            {{ $t('home.allGalleries') }} <span class="arrow">&rarr;</span>
          </RouterLink>
        </div>

        <div class="galleries__grid">
          <RouterLink
            v-for="(gallery, i) in featuredGalleries"
            :key="gallery.slug"
            to="/work"
            data-tile
            data-fade
            class="tile"
            :style="{
              gridColumn: `span ${gallery.grid_span}`,
              aspectRatio: gallery.grid_ratio ?? undefined,
            }"
          >
            <div data-tile-img class="tile__img">
              <ImageSlot
                :src="gallery.images?.preview"
                :alt="gallery.name"
                :placeholder="gallery.name"
                fit="cover"
              />
            </div>
            <div class="tile__scrim" />
            <div class="tile__meta">
              <div>
                <span class="tile__n mono">{{ String(i + 1).padStart(2, '0') }}</span>
                <div class="tile__title">{{ gallery.name }}</div>
              </div>
              <span class="tile__count mono">
                {{ $t('home.frames', { count: gallery.photos_count ?? 0 }) }}
              </span>
            </div>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- COURSES -->
    <section id="courses" class="section section--rule">
      <div class="shell">
        <div class="section-head">
          <div data-fade>
            <span class="eyebrow">{{ section('learn').eyebrow }}</span>
            <h2 class="display">{{ section('learn').heading }}</h2>
          </div>
          <p data-fade class="lede courses__note">{{ section('learn').body }}</p>
        </div>

        <div data-fade class="course-list">
          <RouterLink
            v-for="(course, i) in workshops"
            :key="course.slug"
            :to="`/courses/${course.slug}`"
            data-course
            class="course-row"
          >
            <span class="course-row__n mono">{{ String(i + 1).padStart(2, '0') }}</span>
            <div>
              <div class="course-row__title">{{ course.title }}</div>
              <div class="course-row__sub mono">{{ course.mode }}</div>
            </div>
            <span class="course-row__where mono">{{ course.location }}</span>
            <span class="course-row__status mono">
              {{ course.is_full ? $t('courses.completed') : $t('courses.seatsShort', { count: course.seats_left }) }}
            </span>
            <span class="course-row__price">{{ course.price }}</span>
            <span class="course-row__arrow">&rarr;</span>
          </RouterLink>
        </div>

        <RouterLink to="/courses" data-fade class="btn courses__cta">
          {{ $t('home.seeSchedule') }} <span class="arrow">&rarr;</span>
        </RouterLink>
      </div>
    </section>

    <!-- SHOP -->
    <section id="shop" class="section section--rule">
      <div class="shell">
        <div class="section-head">
          <div data-fade>
            <span class="eyebrow">{{ section('shop').eyebrow }}</span>
            <h2 class="display shop__title">
              {{ section('shop').heading }}
              <span class="shop__badge mono">
                <span class="shop__dot" />{{ section('shop').note }}
              </span>
            </h2>
          </div>
          <p data-fade class="lede shop__note">{{ section('shop').body }}</p>
        </div>

        <div class="shop__grid">
          <div v-for="product in items('shop')" :key="product.label" data-fade data-prod class="product">
            <div class="product__media">
              <div class="product__img">
                <ImageSlot :placeholder="product.note" />
              </div>
              <div class="product__scrim" />
              <div class="product__flag mono">{{ $t('home.soon') }}</div>
            </div>
            <div class="product__foot">
              <div>
                <div class="product__title">{{ product.label }}</div>
                <div class="product__sub mono">{{ product.value }}</div>
              </div>
              <span class="product__soon mono">{{ $t('home.soon') }}</span>
            </div>
          </div>
        </div>

        <div data-fade class="notify">
          <div class="notify__copy">{{ $t('home.notifyPrompt') }}</div>
          <form class="notify__form" @submit.prevent="onNotify">
            <input
              v-model="email"
              class="field"
              type="email"
              required
              placeholder="your@email.com"
              aria-label="Email address"
            />
            <button type="submit" class="btn btn--solid">{{ $t('home.notify') }}</button>
            <span class="notify__msg mono" :style="{ opacity: notified ? 1 : 0 }">
              {{ $t('home.notifyThanks') }}
            </span>
          </form>
        </div>
      </div>
    </section>

    <SiteFooter />
  </div>
</template>

<style scoped>
.home {
  position: relative;
  min-height: 100vh;
}

/* ---------- hero ---------- */

.hero {
  position: relative;
  width: 100%;
  padding: 0 clamp(16px, 2.2vw, 34px);
}

.hero__stage {
  position: relative;
  height: clamp(600px, 92vh, 1040px);
  padding-top: 96px;
}

.hero__headline {
  position: absolute;
  top: 16%;
  left: var(--gutter);
  z-index: 7;
  max-width: min(70%, 900px);
}

.hero__headline h1 {
  font-weight: 700;
  font-size: clamp(58px, 11.5vw, 184px);
  line-height: 0.86;
  letter-spacing: -0.045em;
  text-transform: lowercase;
}

.hero__mark {
  font-size: 0.28em;
  vertical-align: top;
  display: inline-block;
  transform: translateY(0.35em);
  margin-left: 0.06em;
  font-weight: 400;
}

.hero__tagline {
  margin-top: 14px;
  margin-left: 6px;
  font-family: var(--font-mono);
  font-size: clamp(13px, 1.4vw, 18px);
  letter-spacing: 0.06em;
  opacity: 0.85;
  color: var(--accent);
}

.hero__micro {
  position: absolute;
  top: 112px;
  right: var(--gutter);
  z-index: 7;
  text-align: right;
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.16em;
  line-height: 1.9;
  text-transform: uppercase;
  opacity: 0.65;
}

.hero__intro {
  position: absolute;
  left: var(--gutter);
  bottom: clamp(56px, 9vh, 110px);
  z-index: 7;
  max-width: 440px;
}

.hero__intro p {
  font-size: clamp(15px, 1.35vw, 19px);
  line-height: 1.55;
  font-weight: 300;
  letter-spacing: 0.005em;
}

.hero__dash {
  opacity: 0.55;
}

.hero__intro .btn {
  margin-top: 26px;
}

@media (max-width: 720px) {
  .hero__headline {
    max-width: 100%;
  }

  .hero__micro {
    display: none;
  }
}

/* ---------- clients ---------- */

.clients {
  padding: clamp(34px, 4vw, 54px) var(--gutter);
  border-bottom: 1px solid var(--line);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  flex-wrap: wrap;
}

.clients__marquee-wrap {
  flex: 1;
  min-width: 280px;
  overflow: hidden;
  position: relative;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
}

.clients__marquee {
  display: flex;
  width: max-content;
  align-items: center;
  gap: clamp(40px, 5vw, 72px);
  animation: gs-marquee 32s linear infinite;
  opacity: 0.5;
  font-family: var(--font-mono);
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.clients__rating {
  text-align: right;
  white-space: nowrap;
}

.clients__stars {
  letter-spacing: 0.1em;
  font-size: 13px;
}

.clients__stars span {
  color: var(--accent);
}

.clients__note {
  font-size: 11px;
  opacity: 0.55;
  margin-top: 4px;
}

/* ---------- about ---------- */

.about {
  padding: clamp(70px, 10vw, 150px) var(--gutter);
}

.about__grid {
  display: grid;
  grid-template-columns: minmax(0, 0.62fr) minmax(0, 1.38fr);
  gap: clamp(36px, 6vw, 96px);
  align-items: center;
  max-width: var(--maxw);
  margin: 0 auto;
}

.about__portrait {
  position: relative;
  aspect-ratio: 4 / 5;
  border-radius: 8px;
  overflow: hidden;
  max-width: 340px;
}

.about__lead {
  margin-top: 24px;
  font-weight: 400;
  font-size: clamp(26px, 3vw, 44px);
  line-height: 1.22;
  letter-spacing: -0.02em;
  text-wrap: pretty;
}

.about__lead em {
  font-style: italic;
  font-weight: 300;
  opacity: 0.85;
}

.about__copy {
  margin-top: 26px;
  max-width: 520px;
}

.stats {
  display: flex;
  gap: clamp(28px, 4vw, 56px);
  margin-top: 38px;
}

.stats__value {
  font-size: clamp(28px, 3vw, 40px);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.stats__label {
  font-size: 11px;
  letter-spacing: 0.08em;
  opacity: 0.55;
  margin-top: 4px;
  white-space: pre-line;
}

.about__cta {
  margin-top: 40px;
}

@media (max-width: 860px) {
  .about__grid {
    grid-template-columns: 1fr;
  }
}

/* ---------- galleries ---------- */

.galleries {
  padding: clamp(40px, 5vw, 70px) var(--gutter) clamp(70px, 9vw, 130px);
}

.galleries__grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: clamp(14px, 1.6vw, 22px);
}

.tile {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  display: block;
}

.tile__img {
  position: absolute;
  inset: 0;
  transition: transform 1.1s cubic-bezier(0.2, 0, 0.1, 1);
}

.tile__scrim {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(11, 12, 14, 0.1) 40%, rgba(11, 12, 14, 0.75) 100%);
}

.tile__meta {
  position: absolute;
  left: 24px;
  bottom: 22px;
  right: 24px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  z-index: 2;
}

.tile__n {
  font-size: 11px;
  letter-spacing: 0.12em;
  color: var(--accent);
}

.tile__title {
  font-size: clamp(22px, 2.4vw, 32px);
  font-weight: 500;
  letter-spacing: -0.02em;
  margin-top: 4px;
}

.tile__count {
  font-size: 11px;
  opacity: 0.7;
}

@media (max-width: 760px) {
  .galleries__grid {
    grid-template-columns: 1fr;
  }

  .tile {
    grid-column: 1 / -1 !important;
    aspect-ratio: 4 / 3 !important;
  }
}

/* ---------- courses ---------- */

.courses__note {
  max-width: 320px;
}

.course-list {
  border-top: 1px solid var(--line);
}

.course-row {
  display: grid;
  grid-template-columns: 56px minmax(0, 1.6fr) minmax(0, 1fr) 130px 96px 40px;
  align-items: center;
  gap: 20px;
  padding: clamp(22px, 2.4vw, 34px) 8px;
  border-bottom: 1px solid var(--line);
  transition: padding-left 0.4s ease, background 0.4s ease;
}

.course-row:hover {
  background: rgba(242, 240, 234, 0.03);
  padding-left: 20px;
}

.course-row__n {
  font-size: 12px;
  opacity: 0.5;
}

.course-row__title {
  font-size: clamp(20px, 2vw, 28px);
  font-weight: 500;
  letter-spacing: -0.01em;
}

.course-row__sub {
  font-size: 11px;
  opacity: 0.55;
  margin-top: 6px;
}

.course-row__where {
  font-size: 12px;
  letter-spacing: 0.06em;
  opacity: 0.7;
}

.course-row__status {
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.55;
}

.course-row__price {
  font-size: 17px;
  font-weight: 500;
}

.course-row__arrow {
  font-size: 17px;
  text-align: right;
  opacity: 0.7;
}

.courses__cta {
  margin-top: 44px;
}

@media (max-width: 900px) {
  .course-row {
    grid-template-columns: 40px 1fr auto;
    row-gap: 8px;
  }

  .course-row__where,
  .course-row__status {
    grid-column: 2;
  }

  .course-row__price {
    grid-column: 3;
    grid-row: 1;
  }

  .course-row__arrow {
    display: none;
  }
}

/* ---------- shop ---------- */

.shop__title {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}

.shop__badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 15px;
  border: 1px solid var(--accent);
  border-radius: 100px;
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--accent);
  transform: translateY(6px);
}

.shop__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent);
}

.shop__note {
  max-width: 340px;
}

.shop__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: clamp(16px, 2vw, 26px);
}

.product {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--line);
}

.product__media {
  position: relative;
  aspect-ratio: 4 / 5;
  background: var(--panel);
}

.product__img {
  position: absolute;
  inset: 0;
  filter: grayscale(0.35);
  transition: filter 0.6s ease, transform 1.1s cubic-bezier(0.2, 0, 0.1, 1);
}

.product:hover .product__img {
  filter: grayscale(0);
  transform: scale(1.04);
}

.product__scrim {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(11, 12, 14, 0) 55%, rgba(11, 12, 14, 0.7) 100%);
}

.product__flag {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 12px;
  border-radius: 100px;
  background: rgba(11, 12, 14, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(246, 139, 43, 0.5);
  font-size: 9.5px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--accent);
}

.product__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
}

.product__title {
  font-size: 16px;
  font-weight: 500;
}

.product__sub {
  font-size: 10.5px;
  opacity: 0.5;
  margin-top: 4px;
}

.product__soon {
  font-size: 12px;
  letter-spacing: 0.08em;
  color: var(--accent);
}

@media (max-width: 860px) {
  .shop__grid {
    grid-template-columns: 1fr;
  }
}

/* ---------- notify ---------- */

.notify {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
  margin-top: clamp(32px, 4vw, 52px);
  padding: clamp(22px, 2.4vw, 32px);
  border: 1px solid var(--line);
  border-radius: 14px;
  background: rgba(20, 21, 24, 0.4);
}

.notify__copy {
  font-size: clamp(17px, 1.7vw, 22px);
  font-weight: 400;
  letter-spacing: -0.01em;
  max-width: 440px;
  text-wrap: pretty;
}

.notify__form {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.notify__form .btn {
  padding: 13px 24px;
}

.notify__msg {
  font-size: 11px;
  color: var(--accent);
  transition: opacity 0.4s ease;
  width: 100%;
}
</style>
