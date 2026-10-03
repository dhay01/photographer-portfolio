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
import { ratioOf, webSrc } from '../lib/images'
import { mosaic } from '../lib/mosaic'
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

const cells = computed(() => mosaic(shots.value, (photo) => ratioOf(photo.ratio)))

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

          <div v-else class="mosaic">
            <div
              v-for="(cell, i) in cells"
              :key="cell.item.slug"
              :class="['mosaic__cell', `mosaic__cell--${cell.size}`]"
            >
              <button
                type="button"
                data-fade
                class="shot mosaic__frame"
                :aria-label="cell.item.title"
                @click="lbPos = i"
              >
                <ImageSlot :src="webSrc(cell.item.images, 'preview')" :alt="cell.item.alt" fit="cover" />
              </button>
            </div>
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

.shot {
  position: relative;
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  border-radius: 6px;
  overflow: hidden;
  background: var(--panel);
  cursor: pointer;
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
