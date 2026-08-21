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

const openAt = (i) => (lightboxPos.value = i)
const closeLightbox = () => (lightboxPos.value = null)
const step = (delta) => {
  const n = visible.value.length
  lightboxPos.value = (lightboxPos.value + delta + n) % n
}

// Re-stagger the surviving tiles whenever a new set arrives.
watch(photos, async () => {
  closeLightbox()
  await nextTick()
  const tiles = grid.value?.querySelectorAll('[data-tile]')
  if (!tiles?.length) return
  gsap.fromTo(
    tiles,
    { opacity: 0, y: 24 },
    { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.04 },
  )
})
</script>

<template>
  <div class="work">
    <SiteNav />

    <header class="work__head">
      <div>
        <span class="eyebrow">{{ page?.eyebrow }}</span>
        <h1 class="work__title">{{ page?.title }}</h1>
      </div>

      <div class="filters">
        <button
          :class="['filter', { 'filter--on': cat === null }]"
          @click="cat = null"
        >
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
    </header>

    <p v-if="error" class="work__state mono">
      {{ error }}
      <button type="button" class="work__retry" @click="reload(cat)">{{ $t('common.retry') }}</button>
    </p>

    <main v-else ref="grid" :class="['masonry', { 'masonry--pending': pending }]">
      <div
        v-for="(item, i) in visible"
        :key="item.slug"
        data-tile
        class="tile"
        role="button"
        tabindex="0"
        :aria-label="`Open ${item.title}`"
        @click="openAt(i)"
        @keydown.enter="openAt(i)"
        @keydown.space.prevent="openAt(i)"
      >
        <div data-tile-img class="tile__img" :style="{ aspectRatio: item.ratio }">
          <ImageSlot
            :src="item.images?.preview"
            :alt="item.alt"
            :placeholder="`${item.category?.name ?? ''} · ${item.title}`"
          />
        </div>
        <div class="tile__scrim" />
        <div v-if="item.is_zoomable" class="tile__zoom mono">{{ $t('work.zoom') }}</div>
        <div class="tile__meta">
          <div class="tile__name">{{ item.title }}</div>
          <div class="tile__cat mono">{{ item.category?.name }}</div>
        </div>
      </div>
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

/* Keep the grid in place while a filter request is in flight. */
.masonry--pending {
  opacity: 0.45;
  transition: opacity 0.2s ease;
}

.work {
  position: relative;
  min-height: 100vh;
}

.work :deep(.site-nav) {
  position: sticky;
  top: 0;
  padding-block: 22px;
  background: linear-gradient(180deg, rgba(11, 12, 14, 0.9), rgba(11, 12, 14, 0));
}

.work__head {
  padding: clamp(18px, 3vw, 34px) var(--gutter) clamp(20px, 2.5vw, 30px);
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}

.work__title {
  margin-top: 10px;
  font-weight: 700;
  font-size: clamp(30px, 4vw, 54px);
  line-height: 0.95;
  letter-spacing: -0.03em;
  text-transform: lowercase;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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

/* ---------- masonry ---------- */

.masonry {
  padding: 0 clamp(16px, 2.5vw, 40px) clamp(60px, 8vw, 110px);
  column-count: 1;
  column-gap: clamp(14px, 1.6vw, 22px);
}

@media (min-width: 720px) {
  .masonry {
    column-count: 2;
  }
}

@media (min-width: 1200px) {
  .masonry {
    column-count: 3;
  }
}

.tile {
  break-inside: avoid;
  margin-bottom: clamp(14px, 1.6vw, 22px);
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  display: block;
}

.tile__img {
  position: relative;
  transition: transform 1s cubic-bezier(0.2, 0, 0.1, 1);
}

.tile:hover .tile__img,
.tile:focus-visible .tile__img {
  transform: scale(1.05);
}

.tile__scrim {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(11, 12, 14, 0) 45%, rgba(11, 12, 14, 0.82) 100%);
  opacity: 0;
  transition: opacity 0.5s ease;
}

.tile:hover .tile__scrim,
.tile:focus-visible .tile__scrim {
  opacity: 1;
}

.tile__zoom {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 11px;
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

.tile__meta {
  position: absolute;
  left: 16px;
  bottom: 14px;
  right: 16px;
  z-index: 3;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 10px;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.5s ease, transform 0.5s ease;
  pointer-events: none;
}

.tile:hover .tile__meta,
.tile:focus-visible .tile__meta {
  opacity: 1;
  transform: translateY(0);
}

.tile__name {
  font-size: clamp(15px, 1.3vw, 18px);
  font-weight: 500;
  letter-spacing: -0.01em;
}

.tile__cat {
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--accent);
  white-space: nowrap;
}
</style>
