<script setup>
import { ref, computed, nextTick, onBeforeUnmount, watch } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SiteNav from '../components/SiteNav.vue'
import SiteFooter from '../components/SiteFooter.vue'
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

const ratioOf = (photo) => {
  const [w, h] = String(photo?.ratio ?? '3/2').split('/').map(Number)
  return h ? w / h : 1.5
}

// The opening frame plus two more — three photographs in the run, shown at
// full width with no chrome on them at all. Untiled photographs would scroll a grey placeholder,
// so anything with a file wins a slot, and the widest go first — they are what
// the full width is for.
const opener = computed(() => withImages.value[0] ?? all.value[0] ?? null)

const panoramas = computed(() => {
  const pool = withImages.value.slice(1)
  const wide = pool.filter((photo) => ratioOf(photo) >= 1.6)
  // One panorama is not a run. Until more frames are tiled and uploaded, fall
  // back to the widest of whatever else is there rather than showing a single
  // band and calling it a section.
  if (wide.length >= 2) return wide.slice(0, 2)
  return [...pool].sort((a, b) => ratioOf(b) - ratioOf(a)).slice(0, 2)
})

const parallaxShots = computed(() => (opener.value ? [opener.value, ...panoramas.value] : []))

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

    <!-- OPENING FRAME -->
    <section v-if="opener" data-para class="para para--lead">
      <div data-para-img class="para__img">
        <ImageSlot :src="shot(opener)" :alt="opener.alt" :placeholder="opener.title" fit="cover" />
      </div>
      <div class="para__scrim" />

      <div class="para__copy">
        <span class="eyebrow para__eyebrow">{{ page?.eyebrow }}</span>
        <h1 class="para__title">{{ page?.title }}</h1>
      </div>

      <span class="para__cue" aria-hidden="true">&#8964;</span>
    </section>

    <!-- PANORAMAS — nothing on top of them -->
    <section
      v-for="photo in panoramas"
      :key="photo.slug"
      data-para
      class="para"
      role="button"
      tabindex="0"
      :aria-label="`Open ${photo.title}`"
      @click="openLightbox(withImages, withImages.indexOf(photo))"
      @keydown.enter="openLightbox(withImages, withImages.indexOf(photo))"
    >
      <div data-para-img class="para__img">
        <ImageSlot :src="shot(photo)" :alt="photo.alt" :placeholder="photo.title" fit="cover" />
      </div>
    </section>

    <!-- COLLECTIONS -->
    <section id="galleries" class="section collections">
      <div class="shell">
        <h2 class="collections__title">{{ $t('work.galleriesHeading') }}</h2>
        <p class="collections__body">{{ page?.intro ?? $t('work.galleriesBody') }}</p>

        <div class="cats">
          <button
            v-for="c in categories"
            :key="c.slug"
            data-cat
            type="button"
            class="cat"
            :aria-label="`Open ${c.name}`"
            @click="openLightbox(photosIn(c.slug))"
          >
            <span class="cat__img">
              <ImageSlot :src="webSrc(c.images, 'preview')" :alt="c.name" :placeholder="c.name" fit="cover" />
            </span>
            <span class="cat__name">{{ c.name }}</span>
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
  height: 86svh;
  min-height: 430px;
  overflow: hidden;
  cursor: pointer;
}

.para--lead {
  height: 100svh;
  min-height: 520px;
  cursor: default;
}

/* Taller than the frame on both edges: that overhang is the travel. */
.para__img {
  position: absolute;
  inset: -11% 0;
  will-change: transform;
}

/* Only the opening frame is darkened, and only because type sits on it. */
.para__scrim {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    rgba(11, 12, 14, 0.62) 0%,
    rgba(11, 12, 14, 0.08) 38%,
    rgba(11, 12, 14, 0.72) 100%
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

.para__cue {
  position: absolute;
  left: 50%;
  bottom: clamp(26px, 5vh, 52px);
  z-index: 3;
  transform: translateX(-50%);
  font-size: 26px;
  line-height: 1;
  opacity: 0.7;
  animation: gs-cue 2.4s ease-in-out infinite;
}

@keyframes gs-cue {
  0%,
  100% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(6px);
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
  padding: 0;
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
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
