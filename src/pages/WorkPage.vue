<script setup>
import { ref, computed, nextTick, onBeforeUnmount, watch } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SiteNav from '../components/SiteNav.vue'
import Breadcrumbs from '../components/Breadcrumbs.vue'
import SiteFooter from '../components/SiteFooter.vue'
import HeroCarousel from '../components/HeroCarousel.vue'
import ImageSlot from '../components/ImageSlot.vue'
import WorkLightbox from '../components/WorkLightbox.vue'
import { getCategories, getPage, getPhotos } from '../lib/api'
import { webSrc } from '../lib/images'
import { useContent } from '../composables/useContent'

gsap.registerPlugin(ScrollTrigger)

const root = ref(null)

const { data: page } = useContent(getPage.bind(null, 'work'))
const { data: categories } = useContent(() => getCategories('work'), { initial: [] })
// The whole archive arrives once and is filtered here. Nineteen photographs is
// nothing to sort in the browser, and it saves a request per category click.
const { data: photos, error, reload } = useContent((locale) => getPhotos(null, locale), {
  initial: [],
})

const all = computed(() => photos.value ?? [])
const shot = (photo) => webSrc(photo.images, 'preview')
const withImages = computed(() => all.value.filter(shot))

// Every slide's image is fetched up front, so the slider takes a handful of
// frames rather than the whole archive.
const heroSlides = computed(() =>
  withImages.value.slice(0, 5).map((photo) => ({ src: shot(photo), alt: photo.alt })),
)

// Deep-zoom tiles are generated per photograph and most have not been through
// it yet; the slide falls back so the section is never empty.
const zoomables = computed(() => {
  const tiled = all.value.filter((photo) => photo.is_zoomable)
  return tiled.length ? tiled : withImages.value.slice(0, 3)
})

const slide = ref(0)
const current = computed(() => zoomables.value[slide.value] ?? null)
const stepSlide = (delta) => {
  const n = zoomables.value.length
  if (n) slide.value = (slide.value + delta + n) % n
}

/* The lightbox is handed an explicit set rather than reading a filter, so a
   category and the gigapixel slide can each open their own run of frames. */
const lbItems = ref([])
const lbPos = ref(null)
const openLightbox = (items, i = 0) => {
  if (!items.length) return
  lbItems.value = items
  lbPos.value = i
}
const closeLightbox = () => (lbPos.value = null)
const stepLightbox = (delta) => {
  const n = lbItems.value.length
  lbPos.value = (lbPos.value + delta + n) % n
}

let ctx
watch(
  categories,
  async (list) => {
    ctx?.revert()
    ctx = null
    if (!list?.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    await nextTick()
    if (!root.value) return

    ctx = gsap.context(() => {
      root.value.querySelectorAll('[data-cat]').forEach((tile, i) => {
        gsap.from(tile, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          delay: (i % 4) * 0.06,
          scrollTrigger: { trigger: tile, start: 'top 90%' },
        })
      })

      ScrollTrigger.refresh()
    }, root.value)
  },
  { immediate: true },
)

onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <div ref="root" class="work">
    <SiteNav absolute />

    <p v-if="error" class="work__state mono">
      {{ error }}
      <button type="button" class="work__retry" @click="reload()">{{ $t('common.retry') }}</button>
    </p>

    <!-- OPENING SLIDER -->
    <section class="hero">
      <div class="hero__stage">
        <HeroCarousel :slides="heroSlides">
          <div class="hero__copy">
            <Breadcrumbs
              :items="[{ label: $t('nav.home'), to: '/' }, { label: $t('nav.work') }]"
              class="hero__crumbs"
            />
            <span class="eyebrow hero__eyebrow">{{ page?.eyebrow }}</span>
            <h1 class="hero__title">{{ page?.title }}</h1>
          </div>
        </HeroCarousel>
      </div>
    </section>

    <!-- COLLECTIONS -->
    <section id="galleries" class="section collections">
      <div class="shell">
        <h2 class="collections__title">{{ $t('work.galleriesHeading') }}</h2>
        <p class="collections__body">{{ page?.intro ?? $t('work.galleriesBody') }}</p>

        <div class="cats">
          <RouterLink
            v-for="c in categories"
            :key="c.slug"
            data-cat
            :to="`/work/${c.slug}`"
            class="cat"
          >
            <span class="cat__img">
              <ImageSlot :src="webSrc(c.images, 'preview')" :alt="c.name" :placeholder="c.name" fit="cover" />
            </span>
            <span class="cat__name">{{ c.name }}</span>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- GIGAPIXEL SLIDE -->
    <section v-if="current" class="slide">
      <div class="slide__img">
        <ImageSlot :src="shot(current)" :alt="current.alt" :placeholder="current.title" fit="cover" />
      </div>
      <div class="slide__scrim" />

      <div class="slide__copy">
        <span class="eyebrow slide__eyebrow">{{ $t('home.gigapixelEyebrow') }}</span>
        <h2 class="slide__title">{{ $t('home.gigapixelHeading') }}</h2>
        <p class="slide__body">{{ $t('home.gigapixelBody') }}</p>

        <button
          type="button"
          class="btn btn--solid slide__cta"
          @click="openLightbox(zoomables, slide)"
        >
          {{ current.is_zoomable ? $t('home.gigapixelCta') : $t('work.zoom') }}
        </button>
      </div>

      <div v-if="zoomables.length > 1" class="slide__nav">
        <button type="button" class="slide__step" aria-label="Previous" @click="stepSlide(-1)">
          &larr;
        </button>
        <span class="mono slide__counter">
          {{ String(slide + 1).padStart(2, '0') }} / {{ String(zoomables.length).padStart(2, '0') }}
        </span>
        <button type="button" class="slide__step" aria-label="Next" @click="stepSlide(1)">
          &rarr;
        </button>
      </div>
    </section>

    <SiteFooter />

    <WorkLightbox
      v-if="lbPos !== null"
      :items="lbItems"
      :position="lbPos"
      @close="closeLightbox"
      @step="stepLightbox"
    />
  </div>
</template>

<style scoped>
.work {
  position: relative;
  min-height: 100vh;
}

.work__state {
  padding: 40px var(--gutter);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(242, 240, 234, 0.5);
}

.work__retry {
  margin-inline-start: 12px;
  text-decoration: underline;
  color: inherit;
}

/* ---------- opening slider ---------- */

/* The home page's stage, so the two sliders sit in the same frame. */
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

.hero__copy {
  position: absolute;
  top: 16%;
  left: var(--gutter);
  z-index: 7;
  max-width: min(70%, 900px);
}

.hero__crumbs {
  margin-bottom: 22px;
}

.hero__eyebrow {
  display: block;
  margin-bottom: 16px;
}

.hero__title {
  font-weight: 700;
  font-size: clamp(46px, min(9vw, 12vh), 152px);
  line-height: 0.9;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  text-wrap: balance;
}

@media (max-width: 720px) {
  .hero__copy {
    max-width: 100%;
  }
}

/* ---------- collections ---------- */

.collections {
  text-align: center;
}

.collections__title {
  font-size: clamp(40px, 6.5vw, 92px);
  font-weight: 700;
  line-height: 0.95;
  letter-spacing: -0.035em;
}

.collections__body {
  max-width: 620px;
  margin: 20px auto 0;
  font-size: clamp(14px, 1.3vw, 17px);
  line-height: 1.6;
  font-weight: 300;
  opacity: 0.72;
  text-wrap: pretty;
}

.cats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: clamp(18px, 2.4vw, 34px) clamp(16px, 2vw, 28px);
  margin-top: clamp(40px, 5vw, 72px);
  text-align: start;
}

/* No scrim, no counter, no number badge: the photograph is the whole card and
   the name sits under it, out of the way. */
.cat {
  display: block;
  color: inherit;
}

.cat__img {
  position: relative;
  display: block;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  border-radius: 4px;
  background: var(--panel);
}

.cat__img :deep(.slot-img) {
  transition: transform 1.1s cubic-bezier(0.2, 0, 0.1, 1);
}

.cat:hover .cat__img :deep(.slot-img),
.cat:focus-visible .cat__img :deep(.slot-img) {
  transform: scale(1.05);
}

.cat__name {
  display: block;
  margin-top: 14px;
  font-size: clamp(15px, 1.4vw, 18px);
  font-weight: 400;
  letter-spacing: -0.01em;
}

@media (max-width: 900px) {
  .cats {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 560px) {
  .cats {
    grid-template-columns: 1fr;
  }
}

/* ---------- gigapixel slide ---------- */

.slide {
  position: relative;
  height: 100svh;
  min-height: 560px;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.slide__img {
  position: absolute;
  inset: 0;
}

.slide__scrim {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    90deg,
    rgba(11, 12, 14, 0.92) 0%,
    rgba(11, 12, 14, 0.55) 46%,
    rgba(11, 12, 14, 0.15) 100%
  );
}

.slide__copy {
  position: relative;
  z-index: 2;
  max-width: min(520px, 78vw);
  padding: 0 var(--gutter);
}

.slide__eyebrow {
  display: block;
  margin-bottom: 14px;
}

.slide__title {
  font-size: clamp(34px, 5vw, 68px);
  font-weight: 500;
  line-height: 1.02;
  letter-spacing: -0.03em;
}

.slide__body {
  margin-top: 18px;
  font-size: clamp(14px, 1.3vw, 17px);
  line-height: 1.6;
  font-weight: 300;
  opacity: 0.82;
}

.slide__cta {
  margin-top: 30px;
}

.slide__nav {
  position: absolute;
  right: var(--gutter);
  bottom: clamp(28px, 5vh, 54px);
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 14px;
}

.slide__step {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid var(--line);
  border-radius: 50%;
  background: rgba(11, 12, 14, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: var(--ink);
  font-size: 15px;
  cursor: pointer;
  transition: border-color 0.3s ease, background 0.3s ease;
}

.slide__step:hover {
  border-color: var(--line-strong);
  background: rgba(11, 12, 14, 0.75);
}

.slide__counter {
  font-size: 11px;
  letter-spacing: 0.14em;
  opacity: 0.7;
}

@media (max-width: 720px) {
  .slide__scrim {
    background: linear-gradient(180deg, rgba(11, 12, 14, 0.5) 0%, rgba(11, 12, 14, 0.92) 62%);
  }

  .slide {
    align-items: flex-end;
    padding-bottom: clamp(90px, 16vh, 140px);
  }
}
</style>
