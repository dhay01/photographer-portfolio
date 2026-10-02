<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import SiteNav from '../components/SiteNav.vue'
import SiteFooter from '../components/SiteFooter.vue'
import Breadcrumbs from '../components/Breadcrumbs.vue'
import ImageSlot from '../components/ImageSlot.vue'
import WorkLightbox from '../components/WorkLightbox.vue'
import { useSiteMotion } from '../composables/useSiteMotion'
import { getCategories, getPhotos } from '../lib/api'
import { webSrc } from '../lib/images'
import { useContent, useContentFor } from '../composables/useContent'

const root = ref(null)
useSiteMotion(root)

const { t } = useI18n()
const route = useRoute()
const slug = computed(() => route.params.slug)

const { data: categories, pending, error, reload } = useContent(
  (locale) => getCategories('work', locale),
  { initial: [] },
)
const category = computed(() => (categories.value ?? []).find((c) => c.slug === slug.value) ?? null)

const { data: photos, pending: photosPending } = useContentFor(slug, getPhotos, { initial: [] })

// A frame with no file uploaded yet would sit in the grid as an empty panel.
const shots = computed(() => (photos.value ?? []).filter((photo) => webSrc(photo.images, 'preview')))

const ratioOf = (photo) => {
  const [w, h] = String(photo.ratio ?? '3/2').split('/').map(Number)
  return w > 0 && h > 0 ? w / h : 1.5
}

const crumbs = computed(() => [
  { label: t('nav.home'), to: '/' },
  { label: t('nav.work'), to: '/work' },
  { label: category.value?.name ?? '' },
])

const lbPos = ref(null)
const stepLightbox = (delta) => {
  const n = shots.value.length
  lbPos.value = (lbPos.value + delta + n) % n
}
</script>

<template>
  <div ref="root" class="gallery-page">
    <SiteNav />

    <p v-if="pending" class="gallery-page__state mono">{{ $t('common.loading') }}</p>

    <p v-else-if="error" class="gallery-page__state mono">
      {{ error }}
      <button type="button" class="gallery-page__retry" @click="reload()">
        {{ $t('common.retry') }}
      </button>
    </p>

    <div v-else-if="!category" class="gallery-page__state">
      <p class="mono">{{ $t('work.notFound') }}</p>
      <RouterLink to="/work" class="link-mono gallery-page__back">
        {{ $t('home.allGalleries') }} <span class="arrow">&rarr;</span>
      </RouterLink>
    </div>

    <template v-else>
      <header class="gallery-page__head">
        <div class="shell">
          <Breadcrumbs :items="crumbs" class="gallery-page__crumbs" />
          <span v-if="!photosPending" data-reveal class="eyebrow">
            {{ $t('home.frames', { count: shots.length }, shots.length) }}
          </span>
          <h1 data-reveal class="display gallery-page__title">{{ category.name }}</h1>
        </div>
      </header>

      <section class="gallery-page__body">
        <div class="shell">
          <p v-if="!photosPending && !shots.length" class="gallery-page__empty mono">
            {{ $t('work.empty') }}
          </p>

          <div v-else class="justified">
            <button
              v-for="(photo, i) in shots"
              :key="photo.slug"
              type="button"
              data-fade
              class="shot"
              :style="{ '--r': ratioOf(photo) }"
              :aria-label="photo.title"
              @click="lbPos = i"
            >
              <ImageSlot :src="webSrc(photo.images, 'preview')" :alt="photo.alt" fit="cover" />
            </button>
          </div>
        </div>
      </section>
    </template>

    <SiteFooter />

    <WorkLightbox
      v-if="lbPos !== null"
      :items="shots"
      :position="lbPos"
      @close="lbPos = null"
      @step="stepLightbox"
    />
  </div>
</template>

<style scoped>
.gallery-page {
  position: relative;
  min-height: 100vh;
}

.gallery-page :deep(.site-nav) {
  position: sticky;
  top: 0;
  padding-block: 22px;
  background: linear-gradient(180deg, rgba(11, 12, 14, 0.9), rgba(11, 12, 14, 0));
}

.gallery-page__state {
  padding: 120px var(--gutter);
  text-align: center;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(242, 240, 234, 0.5);
}

.gallery-page__retry {
  margin-inline-start: 12px;
  text-decoration: underline;
  color: inherit;
}

.gallery-page__back {
  display: inline-block;
  margin-top: 22px;
  color: var(--ink);
}

.gallery-page__head {
  padding: clamp(20px, 3vw, 40px) var(--gutter) clamp(28px, 3.5vw, 48px);
}

.gallery-page__crumbs {
  margin-bottom: 22px;
}

.gallery-page__title {
  margin-top: 14px;
}

.gallery-page__body {
  padding: 0 var(--gutter) clamp(70px, 9vw, 130px);
}

.gallery-page__empty {
  padding: 60px 0;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.5;
}

/* Justified rows: every frame is shown whole at its own proportions, and each
   row is grown to the full width. Width grows in step with the ratio, so the
   frames in a row come out the same height; the spacer after the last frame
   takes the slack, so a short final row keeps the base height instead of being
   blown up to fill the width. */
.justified {
  display: flex;
  flex-wrap: wrap;
  gap: clamp(10px, 1.2vw, 16px);
}

.justified::after {
  content: '';
  flex-grow: 1000000;
}

.shot {
  --row: clamp(150px, 24vw, 340px);
  position: relative;
  flex: calc(var(--r) * 1000) 1 calc(var(--r) * var(--row));
  aspect-ratio: var(--r);
  padding: 0;
  border: 0;
  border-radius: 6px;
  overflow: hidden;
  background: var(--panel);
  cursor: zoom-in;
}

.shot :deep(.slot-img) {
  transition: transform 1.1s cubic-bezier(0.2, 0, 0.1, 1);
}

.shot:hover :deep(.slot-img),
.shot:focus-visible :deep(.slot-img) {
  transform: scale(1.04);
}

.shot:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}
</style>
