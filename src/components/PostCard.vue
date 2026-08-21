<script setup>
import ImageSlot from './ImageSlot.vue'
import { monthYear } from '../lib/format'

defineProps({
  post: { type: Object, required: true },
  // Related-post cards drop the excerpt and read time.
  compact: { type: Boolean, default: false },
})
</script>

<template>
  <RouterLink :to="`/blog/${post.slug}`" data-tile data-fade class="card">
    <div class="card__media">
      <div data-tile-img class="card__img">
        <ImageSlot
          :src="post.images?.thumb"
          :alt="post.title"
          :placeholder="post.category?.name"
        />
      </div>
    </div>

    <div class="mono card__meta">
      <span class="card__cat">{{ post.category?.name }}</span>
      <span class="card__dot" />
      <span>{{ monthYear(post.published_on) }}</span>
    </div>

    <h3 :class="['card__title', { 'card__title--compact': compact }]">{{ post.title }}</h3>

    <template v-if="!compact">
      <p class="card__excerpt">{{ post.excerpt }}</p>
      <div class="mono card__read">{{ $t('blog.readTime', { minutes: post.read_minutes }) }}</div>
    </template>
  </RouterLink>
</template>

<style scoped>
.card {
  display: block;
}

.card__media {
  position: relative;
  aspect-ratio: 3 / 2;
  border-radius: 8px;
  overflow: hidden;
}

.card__img {
  position: absolute;
  inset: 0;
  transition: transform 1.1s cubic-bezier(0.2, 0, 0.1, 1);
}

.card__meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.6;
}

.card__cat {
  color: var(--accent);
}

.card__dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.5;
}

.card__title {
  margin-top: 12px;
  font-weight: 500;
  font-size: clamp(19px, 1.7vw, 23px);
  line-height: 1.2;
  letter-spacing: -0.015em;
  text-wrap: pretty;
}

.card__title--compact {
  margin-top: 10px;
  font-size: 20px;
}

.card__excerpt {
  margin-top: 10px;
  font-size: 14.5px;
  line-height: 1.65;
  font-weight: 300;
  opacity: 0.65;
  text-wrap: pretty;
}

.card__read {
  margin-top: 14px;
  font-size: 10.5px;
  letter-spacing: 0.08em;
  opacity: 0.45;
}
</style>
