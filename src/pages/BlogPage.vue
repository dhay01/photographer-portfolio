<script setup>
import { computed, ref } from 'vue'
import SiteNav from '../components/SiteNav.vue'
import MiniFooter from '../components/MiniFooter.vue'
import ImageSlot from '../components/ImageSlot.vue'
import PostCard from '../components/PostCard.vue'
import { useSiteMotion } from '../composables/useSiteMotion'
import { getPage, getPosts } from '../lib/api'
import { useContent } from '../composables/useContent'
import { useSite } from '../composables/useSite'
import { monthYear } from '../lib/format'

const root = ref(null)
useSiteMotion(root)

const { site } = useSite()
const { data: page } = useContent(getPage.bind(null, 'blog'))
const { data: posts } = useContent(getPosts, { initial: [] })

// The API sorts featured first; the index gives that one the hero slot.
const featuredPost = computed(() => posts.value?.find((p) => p.is_featured) ?? null)
const listedPosts = computed(() => (posts.value ?? []).filter((p) => !p.is_featured))

const email = ref('')
const subscribed = ref(false)

const onSubscribe = () => {
  subscribed.value = true
  email.value = ''
}

const footerLinks = computed(() => {
  const instagram = site.value?.socials?.[0]

  return [
    ...(instagram ? [{ label: instagram.label, href: instagram.href }] : []),
    { key: 'contact', to: '/#contact' },
    { key: 'home', to: '/' },
  ]
})
</script>

<template>
  <div ref="root" class="blog">
    <SiteNav />

    <header class="blog__head">
      <span class="eyebrow">{{ page?.eyebrow }}</span>
      <div class="blog__head-row">
        <h1 class="blog__title" style="white-space: pre-line">{{ page?.title }}</h1>
        <p class="lede blog__intro">{{ page?.intro }}</p>
      </div>
    </header>

    <!-- FEATURED -->
    <section v-if="featuredPost" class="featured-wrap">
      <RouterLink :to="`/blog/${featuredPost.slug}`" data-tile data-fade class="featured">
        <div class="featured__media">
          <div data-tile-img class="featured__img">
            <ImageSlot
              :src="featuredPost.images?.preview"
              :alt="featuredPost.title"
              placeholder="featured cover"
            />
          </div>
          <div class="mono featured__flag">{{ $t('blog.featured') }}</div>
        </div>

        <div>
          <div class="mono featured__meta">
            <span class="featured__cat">{{ featuredPost.category?.name }}</span>
            <span class="featured__dot" />
            <span>{{ monthYear(featuredPost.published_on) }}</span>
            <span class="featured__dot" />
            <span>{{ $t('blog.readTime', { minutes: featuredPost.read_minutes }) }}</span>
          </div>
          <h2 class="featured__title">{{ featuredPost.title }}</h2>
          <p class="featured__excerpt">{{ featuredPost.excerpt }}</p>
          <span class="mono featured__cta">
            {{ $t('blog.readStory') }} <span class="featured__arrow">&rarr;</span>
          </span>
        </div>
      </RouterLink>
    </section>

    <!-- ALL ARTICLES -->
    <section class="articles">
      <div class="articles__head">
        <span class="mono articles__label">{{ $t('blog.allArticles') }}</span>
        <span class="mono articles__count">{{ String(posts?.length ?? 0).padStart(2, '0') }}</span>
      </div>

      <div class="articles__grid">
        <PostCard v-for="post in listedPosts" :key="post.slug" :post="post" />
      </div>
    </section>

    <!-- SUBSCRIBE -->
    <section class="subscribe">
      <div class="subscribe__inner">
        <h2 class="subscribe__title">
          {{ page?.sections?.subscribe?.heading }}<br />{{ page?.sections?.subscribe?.body }}
        </h2>
        <form class="subscribe__form" @submit.prevent="onSubscribe">
          <input
            v-model="email"
            class="field subscribe__field"
            type="email"
            required
            placeholder="your@email.com"
            aria-label="Email address"
          />
          <button type="submit" class="btn btn--solid subscribe__btn">{{ $t('blog.subscribe') }}</button>
          <span class="mono subscribe__msg" :style="{ opacity: subscribed ? 1 : 0 }">
            {{ $t('blog.subscribeThanks') }}
          </span>
        </form>
      </div>
    </section>

    <MiniFooter :links="footerLinks" />
  </div>
</template>

<style scoped>
.blog {
  position: relative;
  min-height: 100vh;
}

.blog :deep(.site-nav) {
  position: sticky;
  top: 0;
  padding-block: 22px;
  background: linear-gradient(180deg, rgba(11, 12, 14, 0.9), rgba(11, 12, 14, 0));
}

.blog__head {
  padding: clamp(20px, 3vw, 40px) var(--gutter) clamp(24px, 3vw, 40px);
}

.blog__head-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.blog__title {
  font-weight: 700;
  font-size: clamp(34px, 5vw, 72px);
  line-height: 0.92;
  letter-spacing: -0.035em;
  text-transform: lowercase;
}

.blog__intro {
  max-width: 340px;
}

/* ---------- featured ---------- */

.featured-wrap {
  padding: 0 var(--gutter) clamp(30px, 4vw, 54px);
}

.featured {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: clamp(24px, 4vw, 56px);
  align-items: center;
  border-top: 1px solid var(--line);
  padding-top: clamp(28px, 3vw, 44px);
}

@media (max-width: 860px) {
  .featured {
    grid-template-columns: 1fr;
  }
}

.featured__media {
  position: relative;
  aspect-ratio: 16 / 10;
  border-radius: 8px;
  overflow: hidden;
}

.featured__img {
  position: absolute;
  inset: 0;
  transition: transform 1.1s cubic-bezier(0.2, 0, 0.1, 1);
}

.featured__flag {
  position: absolute;
  top: 14px;
  left: 14px;
  padding: 7px 13px;
  border-radius: 100px;
  background: var(--accent);
  color: var(--bg);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-weight: 700;
}

.featured__meta {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.6;
}

.featured__cat {
  color: var(--accent);
}

.featured__dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.5;
}

.featured__title {
  margin-top: 20px;
  font-weight: 500;
  font-size: clamp(26px, 3vw, 44px);
  line-height: 1.08;
  letter-spacing: -0.025em;
  text-wrap: pretty;
}

.featured__excerpt {
  margin-top: 18px;
  max-width: 460px;
  font-size: 16px;
  line-height: 1.7;
  font-weight: 300;
  opacity: 0.72;
  text-wrap: pretty;
}

.featured__cta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-top: 26px;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--accent);
}

.featured__arrow {
  font-family: var(--font-sans);
  font-size: 15px;
}

/* ---------- article grid ---------- */

.articles {
  padding: 0 var(--gutter) clamp(40px, 5vw, 70px);
}

.articles__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--line);
  padding-top: 24px;
  margin-bottom: clamp(24px, 3vw, 40px);
}

.articles__label {
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  opacity: 0.55;
}

.articles__count {
  font-size: 11px;
  letter-spacing: 0.1em;
  opacity: 0.4;
}

.articles__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: clamp(24px, 3vw, 44px);
}

/* ---------- subscribe ---------- */

.subscribe {
  padding: clamp(50px, 7vw, 100px) var(--gutter);
  border-top: 1px solid var(--line);
}

.subscribe__inner {
  max-width: var(--maxw);
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  flex-wrap: wrap;
}

.subscribe__title {
  font-weight: 400;
  font-size: clamp(24px, 2.6vw, 38px);
  line-height: 1.1;
  letter-spacing: -0.02em;
  text-wrap: pretty;
}

.subscribe__form {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.subscribe__field {
  padding: 14px 22px;
  min-width: 240px;
}

.subscribe__btn {
  padding: 14px 26px;
}

.subscribe__msg {
  font-size: 11px;
  color: var(--accent);
  transition: opacity 0.4s ease;
  width: 100%;
}
</style>
