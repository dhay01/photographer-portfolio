<script setup>
import { ref, computed, nextTick, onBeforeUnmount, watch } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SiteNav from '../components/SiteNav.vue'
import SiteFooter from '../components/SiteFooter.vue'
import ImageSlot from '../components/ImageSlot.vue'
import WorkLightbox from '../components/WorkLightbox.vue'
import { getCategories, getPage, getPhotos } from '../lib/api'
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
const shot = (photo) => photo.images?.full ?? photo.images?.preview
const withImages = computed(() => all.value.filter(shot))

// Two frames carry the parallax. Untiled photographs would parallax a grey
// placeholder, so anything with a file wins the slot.
const parallaxShots = computed(() =>
  (withImages.value.length ? withImages.value : all.value).slice(0, 2),
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

const photosIn = (slug) => all.value.filter((photo) => photo.category?.slug === slug)

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
  parallaxShots,
  async (list) => {
    ctx?.revert()
    ctx = null
    if (!list.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    await nextTick()
    if (!root.value) return

    ctx = gsap.context(() => {
      root.value.querySelectorAll('[data-para]').forEach((panel) => {
        // The image is taller than the frame that crops it, and that overhang is
        // what it travels through as the page scrolls.
        gsap.fromTo(
          panel.querySelector('[data-para-img]'),
          { yPercent: -8 },
          {
            yPercent: 8,
            ease: 'none',
            scrollTrigger: { trigger: panel, start: 'top bottom', end: 'bottom top', scrub: 0.5 },
          },
        )
      })

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

    <!-- PARALLAX -->
    <section
      v-for="(photo, i) in parallaxShots"
      :key="photo.slug"
      data-para
      :class="['para', { 'para--lead': i === 0 }]"
    >
      <div data-para-img class="para__img">
        <ImageSlot :src="shot(photo)" :alt="photo.alt" :placeholder="photo.title" fit="cover" />
      </div>
      <div class="para__scrim" />

      <div v-if="i === 0" class="para__copy">
        <span class="eyebrow para__eyebrow">{{ page?.eyebrow }}</span>
        <h1 class="para__title">{{ page?.title }}</h1>
      </div>
      <div v-else class="para__cap mono">{{ photo.title }}</div>
    </section>

    <!-- CATEGORY GRID -->
    <section id="galleries" class="section section--rule">
      <div class="shell">
        <div class="section-head">
          <div>
            <span class="eyebrow">{{ $t('work.galleriesEyebrow') }}</span>
            <h2 class="display">{{ $t('work.galleriesHeading') }}</h2>
          </div>
        </div>

        <div class="cats">
          <button
            v-for="(c, i) in categories"
            :key="c.slug"
            data-cat
            type="button"
            class="cat"
            :style="{
              gridColumn: `span ${c.grid_span ?? 4}`,
              aspectRatio: c.grid_ratio ?? '4 / 3',
            }"
            :aria-label="`Open ${c.name}`"
            @click="openLightbox(photosIn(c.slug))"
          >
            <div class="cat__img">
              <ImageSlot
                :src="c.images?.preview"
                :alt="c.name"
                :placeholder="c.name"
                fit="cover"
              />
            </div>
            <div class="cat__scrim" />
            <div class="cat__meta">
              <div>
                <span class="cat__n mono">{{ String(i + 1).padStart(2, '0') }}</span>
                <div class="cat__name">{{ c.name }}</div>
              </div>
              <span class="cat__count mono">
                {{ $t('home.frames', { count: c.photos_count ?? 0 }) }}
              </span>
            </div>
          </button>
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

/* ---------- parallax ---------- */

.para {
  position: relative;
  height: 74svh;
  min-height: 420px;
  overflow: hidden;
}

.para--lead {
  height: 100svh;
  min-height: 520px;
}

/* Taller than the frame on both edges: that overhang is the travel. */
.para__img {
  position: absolute;
  inset: -11% 0;
  will-change: transform;
}

.para__scrim {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    rgba(11, 12, 14, 0.7) 0%,
    rgba(11, 12, 14, 0.1) 36%,
    rgba(11, 12, 14, 0.8) 100%
  );
}

.para__copy {
  position: absolute;
  left: 0;
  right: 0;
  bottom: clamp(60px, 11vh, 130px);
  z-index: 2;
  padding: 0 var(--gutter);
  text-align: center;
}

.para__eyebrow {
  display: block;
  margin-bottom: 16px;
}

.para__title {
  font-weight: 700;
  font-size: clamp(38px, 9.5vw, 168px);
  line-height: 0.9;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  text-wrap: balance;
}

.para__cap {
  position: absolute;
  left: var(--gutter);
  bottom: clamp(20px, 3vw, 34px);
  z-index: 2;
  font-size: 10.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.7;
}

/* ---------- category grid ---------- */

.cats {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: clamp(14px, 1.6vw, 22px);
}

.cat {
  position: relative;
  display: block;
  padding: 0;
  border: none;
  border-radius: 8px;
  overflow: hidden;
  background: var(--panel);
  color: inherit;
  cursor: pointer;
}

.cat__img {
  position: absolute;
  inset: 0;
  transition: transform 1.1s cubic-bezier(0.2, 0, 0.1, 1);
}

.cat:hover .cat__img,
.cat:focus-visible .cat__img {
  transform: scale(1.06);
}

.cat__scrim {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(11, 12, 14, 0.1) 40%, rgba(11, 12, 14, 0.78) 100%);
}

.cat__meta {
  position: absolute;
  left: 22px;
  right: 22px;
  bottom: 20px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  z-index: 2;
  text-align: start;
}

.cat__n {
  font-size: 11px;
  letter-spacing: 0.12em;
  color: var(--accent);
}

.cat__name {
  font-size: clamp(20px, 2.2vw, 30px);
  font-weight: 500;
  letter-spacing: -0.02em;
  margin-top: 4px;
}

.cat__count {
  font-size: 11px;
  opacity: 0.7;
  white-space: nowrap;
}

@media (max-width: 760px) {
  .cats {
    grid-template-columns: 1fr;
  }

  .cat {
    grid-column: 1 / -1 !important;
    aspect-ratio: 4 / 3 !important;
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
