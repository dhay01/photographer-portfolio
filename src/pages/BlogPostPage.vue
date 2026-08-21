<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import SiteNav from '../components/SiteNav.vue'
import MiniFooter from '../components/MiniFooter.vue'
import ImageSlot from '../components/ImageSlot.vue'
import PostCard from '../components/PostCard.vue'
import { useSiteMotion } from '../composables/useSiteMotion'
import { getPost, relatedTo, author } from '../data/posts'

const root = ref(null)
useSiteMotion(root)

const route = useRoute()
const post = computed(() => getPost(route.params.slug))
const related = computed(() => relatedTo(post.value))

// Reading-progress bar.
const progress = ref(0)
const onScroll = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight
  progress.value = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

const footerLinks = [
  { label: 'The journal', to: '/blog' },
  { label: 'Contact', to: '/#contact' },
  { label: 'Home →', to: '/' },
]
</script>

<template>
  <div ref="root" class="post">
    <div class="progress" :style="{ width: `${progress}%` }" />

    <SiteNav />

    <header class="post__head">
      <RouterLink to="/blog" class="mono post__back">&larr; The journal</RouterLink>

      <div data-reveal class="mono post__meta">
        <span class="post__cat">{{ post.cat }}</span>
        <span class="post__dot" />
        <span>{{ post.date }}</span>
        <span class="post__dot" />
        <span>{{ post.read }}</span>
      </div>

      <h1 data-reveal class="post__title">{{ post.title }}</h1>
      <p data-reveal class="post__standfirst">{{ post.standfirst ?? post.excerpt }}</p>

      <div data-reveal class="byline">
        <span class="byline__avatar">
          <ImageSlot :src="author.photo" :alt="author.name" />
        </span>
        <div class="mono byline__name">
          <span>{{ author.name }}</span><span class="byline__loc"> &middot; {{ author.location }}</span>
        </div>
      </div>
    </header>

    <section class="cover-wrap">
      <div data-reveal class="cover">
        <div class="cover__img">
          <ImageSlot :src="post.src" :alt="post.title" placeholder="article cover · 16:9" />
        </div>
      </div>
    </section>

    <!-- BODY -->
    <article class="article">
      <template v-if="post.body">
        <template v-for="(block, i) in post.body" :key="i">
          <div v-if="block.type === 'text'" class="prose" data-fade>
            <p v-for="(para, j) in block.paragraphs" :key="j">{{ para }}</p>
          </div>

          <h2 v-else-if="block.type === 'heading'" data-fade class="article__h2">
            {{ block.text }}
          </h2>

          <figure v-else-if="block.type === 'figure'" data-fade class="figure">
            <div class="figure__media" :style="{ aspectRatio: block.ratio }">
              <ImageSlot :src="block.src" :alt="block.caption" placeholder="inline photo" />
            </div>
            <figcaption class="mono figure__caption">{{ block.caption }}</figcaption>
          </figure>

          <blockquote v-else-if="block.type === 'quote'" data-fade class="pull-quote">
            <p>{{ block.text }}</p>
          </blockquote>
        </template>
      </template>

      <div v-else class="prose" data-fade>
        <p>{{ post.excerpt }}</p>
        <p>This story is still being written — check back soon.</p>
      </div>

      <div v-if="post.tags" data-fade class="tags">
        <span v-for="tag in post.tags" :key="tag" class="chip mono">{{ tag }}</span>
      </div>
    </article>

    <!-- AUTHOR -->
    <section class="author-wrap">
      <div data-fade class="author">
        <div class="author__photo">
          <ImageSlot :src="author.photo" :alt="author.name" placeholder="author" />
        </div>
        <div>
          <div class="mono author__label">Written by</div>
          <div class="author__name">{{ author.name }}</div>
          <p class="author__bio">{{ author.bio }}</p>
          <a :href="author.follow" target="_blank" rel="noopener" class="mono author__follow">
            Follow &rarr;
          </a>
        </div>
      </div>
    </section>

    <!-- RELATED -->
    <section class="related">
      <div class="shell">
        <span class="mono related__label">Keep reading</span>
        <div class="related__grid">
          <PostCard v-for="item in related" :key="item.slug" :post="item" compact />
        </div>
      </div>
    </section>

    <MiniFooter :links="footerLinks" />
  </div>
</template>

<style scoped>
.post {
  position: relative;
  min-height: 100vh;
}

.progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 2px;
  background: var(--accent);
  z-index: 1001;
}

.post :deep(.site-nav) {
  position: sticky;
  top: 0;
  padding-block: 22px;
  background: linear-gradient(180deg, rgba(11, 12, 14, 0.9), rgba(11, 12, 14, 0));
}

/* ---------- header ---------- */

.post__head {
  padding: clamp(16px, 2vw, 28px) var(--gutter) clamp(28px, 3.5vw, 44px);
  max-width: 900px;
  margin: 0 auto;
}

.post__back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.6;
}

.post__meta {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 26px;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.65;
}

.post__cat {
  color: var(--accent);
}

.post__dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.5;
}

.post__title {
  margin-top: 18px;
  font-weight: 600;
  font-size: clamp(34px, 5vw, 68px);
  line-height: 1.02;
  letter-spacing: -0.03em;
  text-wrap: pretty;
}

.post__standfirst {
  margin-top: 22px;
  font-size: clamp(17px, 1.6vw, 21px);
  line-height: 1.5;
  font-weight: 300;
  opacity: 0.72;
  text-wrap: pretty;
}

.byline {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 26px;
}

.byline__avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  overflow: hidden;
  flex: none;
}

.byline__name {
  font-size: 12px;
  opacity: 0.9;
}

.byline__loc {
  opacity: 0.5;
}

/* ---------- cover ---------- */

.cover-wrap {
  padding: 0 var(--gutter) clamp(32px, 4vw, 54px);
}

.cover {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  aspect-ratio: 16 / 9;
  border-radius: 10px;
  overflow: hidden;
}

.cover__img {
  position: absolute;
  inset: 0;
  animation: gs-kb-post 11s ease-in-out infinite alternate;
}

@keyframes gs-kb-post {
  0% {
    transform: scale(1.03);
  }
  100% {
    transform: scale(1.1);
  }
}

/* ---------- article body ---------- */

.article {
  padding: 0 var(--gutter) clamp(50px, 6vw, 80px);
  max-width: 760px;
  margin: 0 auto;
}

.prose p {
  font-size: clamp(16px, 1.35vw, 19px);
  line-height: 1.8;
  font-weight: 300;
  opacity: 0.85;
  margin-top: 24px;
  text-wrap: pretty;
}

.prose p:first-child {
  margin-top: 0;
}

.article__h2 {
  margin-top: clamp(40px, 5vw, 60px);
  font-weight: 600;
  font-size: clamp(24px, 2.6vw, 34px);
  letter-spacing: -0.02em;
}

.article__h2 + .prose {
  margin-top: 24px;
}

.figure {
  margin-top: clamp(36px, 4vw, 54px);
}

.figure__media {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
}

.figure__caption {
  margin-top: 12px;
  font-size: 11px;
  letter-spacing: 0.04em;
  opacity: 0.5;
}

.pull-quote {
  margin: clamp(44px, 5vw, 64px) 0;
  padding-left: 24px;
  border-left: 2px solid var(--accent);
}

.pull-quote p {
  font-size: clamp(22px, 2.6vw, 32px);
  line-height: 1.3;
  font-weight: 300;
  letter-spacing: -0.01em;
  text-wrap: pretty;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: clamp(44px, 5vw, 60px);
  padding-top: 28px;
  border-top: 1px solid var(--line);
}

.chip {
  font-size: 10.5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 8px 14px;
  border: 1px solid var(--line);
  border-radius: 100px;
  opacity: 0.8;
}

/* ---------- author ---------- */

.author-wrap {
  padding: 0 var(--gutter) clamp(50px, 6vw, 80px);
  max-width: 760px;
  margin: 0 auto;
}

.author {
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: 22px;
  align-items: center;
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: clamp(20px, 2.4vw, 30px);
  background: rgba(20, 21, 24, 0.4);
}

.author__photo {
  aspect-ratio: 1 / 1;
  border-radius: 12px;
  overflow: hidden;
}

.author__label {
  font-size: 10.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.5;
}

.author__name {
  font-size: 19px;
  font-weight: 500;
  margin-top: 5px;
}

.author__bio {
  margin-top: 8px;
  font-size: 14px;
  line-height: 1.6;
  font-weight: 300;
  opacity: 0.72;
  text-wrap: pretty;
}

.author__follow {
  display: inline-block;
  margin-top: 10px;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--accent);
}

/* ---------- related ---------- */

.related {
  padding: clamp(30px, 4vw, 50px) var(--gutter) clamp(50px, 6vw, 80px);
  border-top: 1px solid var(--line);
}

.related__label {
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  opacity: 0.55;
}

.related__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: clamp(24px, 3vw, 44px);
  margin-top: clamp(24px, 3vw, 36px);
}

@media (max-width: 520px) {
  .author {
    grid-template-columns: 1fr;
  }
}
</style>
