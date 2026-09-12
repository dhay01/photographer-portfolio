<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import gsap from 'gsap'
import SiteNav from '../components/SiteNav.vue'
import ImageSlot from '../components/ImageSlot.vue'
import WorkLightbox from '../components/WorkLightbox.vue'
import { getCategories, getPage, getPhotos } from '../lib/api'
import { useContent, useContentFor } from '../composables/useContent'

const grid = ref(null)
// null is the "All" pill — the API filters server-side when a slug is set.
const cat = ref(null)
const lightboxPos = ref(null)

const { data: page } = useContent(getPage.bind(null, 'work'))
const { data: categories } = useContent(() => getCategories('work'), { initial: [] })
const { data: photos, pending, error, reload } = useContentFor(cat, getPhotos, { initial: [] })

const visible = computed(() => photos.value ?? [])

// The opening frame is the page; everything after it is the stream. Indices stay
// relative to `visible` so the lightbox can still walk the whole set.
const opener = computed(() => visible.value[0] ?? null)
const stream = computed(() => visible.value.slice(1))

/**
 * Ratios arrive as CSS-ish strings ("21/9", "4/5"). Anything wider than about
 * 2:1 is a panorama and earns the full width of the screen; the rest are held
 * in a centred column so the page keeps a rhythm instead of becoming a wall.
 */
const ratioOf = (photo) => {
  const [w, h] = String(photo?.ratio ?? '3/2').split('/').map(Number)
  return h ? w / h : 1.5
}
const isPanoramic = (photo) => ratioOf(photo) >= 1.9

const openAt = (i) => (lightboxPos.value = i)
const closeLightbox = () => (lightboxPos.value = null)
const step = (delta) => {
  const n = visible.value.length
  lightboxPos.value = (lightboxPos.value + delta + n) % n
}

const scrollToStream = () => {
  grid.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// Re-stagger the surviving frames whenever a new set arrives.
watch(photos, async () => {
  closeLightbox()
  await nextTick()
  const frames = grid.value?.querySelectorAll('[data-frame]')
  if (!frames?.length) return
  gsap.fromTo(
    frames,
    { opacity: 0, y: 28 },
    { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.05 },
  )
})
</script>

<template>
  <div class="work">
    <SiteNav absolute />

    <!-- OPENING FRAME -->
    <section v-if="opener" class="stage">
      <div class="stage__img">
        <ImageSlot
          :src="opener.images?.full ?? opener.images?.preview"
          :alt="opener.alt"
          :placeholder="opener.title"
          fit="cover"
        />
      </div>
      <div class="stage__scrim" />

      <div class="stage__copy">
        <span class="eyebrow stage__eyebrow">{{ page?.eyebrow }}</span>
        <h1 class="stage__title">{{ page?.title }}</h1>
      </div>

      <button type="button" class="stage__cue" aria-label="Scroll to the work" @click="scrollToStream">
        <span class="stage__chev">&#8964;</span>
      </button>
    </section>

    <!-- A page with no opener still needs a heading. -->
    <header v-else class="stage stage--bare">
      <span class="eyebrow stage__eyebrow">{{ page?.eyebrow }}</span>
      <h1 class="stage__title">{{ page?.title }}</h1>
    </header>

    <!-- FILTERS -->
    <div class="filters">
      <button :class="['filter', { 'filter--on': cat === null }]" @click="cat = null">
        {{ $t('work.all') }}
      </button>
      <button
        v-for="c in categories"
        :key="c.slug"
        :class="['filter', { 'filter--on': c.slug === cat }]"
        @click="cat = c.slug"
      >
        {{ c.name }}
      </button>
    </div>

    <p v-if="error" class="work__state mono">
      {{ error }}
      <button type="button" class="work__retry" @click="reload(cat)">{{ $t('common.retry') }}</button>
    </p>

    <!-- STREAM -->
    <main v-else ref="grid" :class="['stream', { 'stream--pending': pending }]">
      <figure
        v-for="(item, i) in stream"
        :key="item.slug"
        data-frame
        :class="['frame', { 'frame--wide': isPanoramic(item) }]"
        role="button"
        tabindex="0"
        :aria-label="`Open ${item.title}`"
        @click="openAt(i + 1)"
        @keydown.enter="openAt(i + 1)"
        @keydown.space.prevent="openAt(i + 1)"
      >
        <div class="frame__img" :style="{ aspectRatio: item.ratio }">
          <ImageSlot
            :src="item.images?.full ?? item.images?.preview"
            :alt="item.alt"
            :placeholder="`${item.category?.name ?? ''} · ${item.title}`"
            fit="cover"
          />
        </div>

        <span v-if="item.is_zoomable" class="frame__zoom mono">{{ $t('work.zoom') }}</span>

        <figcaption class="frame__cap">
          <span class="frame__n mono">{{ String(i + 1).padStart(2, '0') }}</span>
          <span class="frame__name">{{ item.title }}</span>
          <span class="frame__meta mono">
            {{ item.category?.name }}
            <template v-if="item.location">&nbsp;&middot;&nbsp;{{ item.location }}</template>
          </span>
        </figcaption>
      </figure>
    </main>

    <WorkLightbox
      v-if="lightboxPos !== null"
      :items="visible"
      :position="lightboxPos"
      @close="closeLightbox"
      @step="step"
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

/* ---------- opening frame ---------- */

.stage {
  position: relative;
  height: 100svh;
  min-height: 520px;
  overflow: hidden;
}

.stage__img {
  position: absolute;
  inset: 0;
}

.stage__scrim {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(180deg, rgba(11, 12, 14, 0.72) 0%, rgba(11, 12, 14, 0.12) 34%, rgba(11, 12, 14, 0.86) 100%);
}

.stage__copy {
  position: absolute;
  left: 0;
  right: 0;
  bottom: clamp(90px, 14vh, 170px);
  z-index: 2;
  padding: 0 var(--gutter);
  text-align: center;
}

.stage__eyebrow {
  display: block;
  margin-bottom: 16px;
}

.stage__title {
  font-weight: 700;
  /* Deliberately set to fill the width: the title is part of the image here,
     not a label sitting above it. */
  font-size: clamp(38px, 9.5vw, 168px);
  line-height: 0.9;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  text-wrap: balance;
}

.stage__cue {
  position: absolute;
  left: 50%;
  bottom: clamp(28px, 5vh, 56px);
  z-index: 3;
  transform: translateX(-50%);
  padding: 10px 18px;
  border: none;
  background: transparent;
  color: var(--ink);
  cursor: pointer;
  opacity: 0.75;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.stage__cue:hover {
  opacity: 1;
  transform: translateX(-50%) translateY(3px);
}

.stage__chev {
  display: block;
  font-size: 26px;
  line-height: 1;
  animation: gs-cue 2.4s ease-in-out infinite;
}

@keyframes gs-cue {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(6px);
  }
}

.stage--bare {
  height: auto;
  min-height: 0;
  padding: clamp(150px, 20vh, 240px) var(--gutter) clamp(30px, 4vw, 50px);
  text-align: start;
}

/* ---------- filters ---------- */

.filters {
  position: sticky;
  top: 0;
  z-index: 12;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  padding: clamp(18px, 2.4vw, 28px) var(--gutter);
  background: linear-gradient(180deg, rgba(11, 12, 14, 0.92), rgba(11, 12, 14, 0));
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.filter {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 9px 16px;
  border: 1px solid var(--line);
  border-radius: 100px;
  background: transparent;
  color: var(--ink);
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter:hover {
  border-color: var(--line-strong);
}

.filter--on {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--bg);
}

/* ---------- stream ---------- */

.stream {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(60px, 9vw, 150px);
  padding: clamp(30px, 5vw, 70px) 0 clamp(80px, 11vw, 170px);
}

.stream--pending {
  opacity: 0.45;
  transition: opacity 0.2s ease;
}

.frame {
  position: relative;
  width: min(1180px, calc(100% - 2 * var(--gutter)));
  margin: 0;
  cursor: pointer;
}

/* Panoramas are the reason this page exists — they get the whole screen. */
.frame--wide {
  width: 100%;
}

.frame__img {
  position: relative;
  overflow: hidden;
  max-height: 88svh;
  background: var(--panel);
  transition: transform 1.1s cubic-bezier(0.2, 0, 0.1, 1);
}

.frame:not(.frame--wide) .frame__img {
  border-radius: 4px;
}

.frame:hover .frame__img,
.frame:focus-visible .frame__img {
  transform: scale(1.012);
}

.frame__zoom {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 3;
  padding: 7px 13px;
  border-radius: 100px;
  background: rgba(11, 12, 14, 0.55);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(246, 139, 43, 0.5);
  font-size: 9.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--accent);
  pointer-events: none;
}

/* The caption sits under the frame rather than over it: an overlay competes
   with the photograph, which is the opposite of the point. */
.frame__cap {
  display: flex;
  align-items: baseline;
  gap: 14px;
  padding: 16px var(--gutter) 0;
  flex-wrap: wrap;
}

.frame--wide .frame__cap {
  justify-content: center;
}

.frame__n {
  font-size: 11px;
  letter-spacing: 0.12em;
  color: var(--accent);
}

.frame__name {
  font-size: clamp(15px, 1.4vw, 19px);
  font-weight: 500;
  letter-spacing: -0.01em;
}

.frame__meta {
  font-size: 10.5px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.55;
}

@media (max-width: 720px) {
  .frame,
  .frame--wide {
    width: 100%;
  }

  .frame__img {
    border-radius: 0;
  }
}
</style>
