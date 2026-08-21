<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useSite } from '../composables/useSite'

defineProps({
  // Home overlays the nav on the hero; inner pages sit it above content.
  absolute: { type: Boolean, default: false },
})

const { site } = useSite()

// Routes are structural, so they stay here; only the visible labels are
// translated, and the wordmark comes from the dashboard.
const links = [
  { key: 'home', to: '/' },
  { key: 'about', to: '/about' },
  { key: 'work', to: '/work' },
  { key: 'courses', to: '/courses' },
  { key: 'journal', to: '/blog' },
  { key: 'contact', to: '/#contact' },
]

const route = useRoute()
const open = ref(false)

watch(() => route.fullPath, () => (open.value = false))
</script>

<template>
  <nav :class="['site-nav', { 'site-nav--absolute': absolute }]">
    <RouterLink to="/" data-reveal class="wordmark">
      {{ site?.name }}<span class="wordmark__mark">&reg;</span>
    </RouterLink>

    <div data-reveal class="nav-links">
      <RouterLink v-for="link in links" :key="link.to" :to="link.to" class="nav-link">
        {{ $t(`nav.${link.key}`) }}
      </RouterLink>
    </div>

    <button
      data-reveal
      class="nav-toggle"
      :aria-expanded="open"
      :aria-label="$t('nav.menu')"
      @click="open = !open"
    >
      <span :class="{ 'is-open-top': open }" />
      <span :class="{ 'is-open-bottom': open }" />
    </button>

    <div v-if="open" class="nav-drawer">
      <RouterLink v-for="link in links" :key="link.to" :to="link.to" class="nav-drawer__link">
        {{ $t(`nav.${link.key}`) }}
      </RouterLink>
    </div>
  </nav>
</template>

<style scoped>
.site-nav {
  position: relative;
  width: 100%;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 26px var(--gutter);
}

.site-nav--absolute {
  position: absolute;
  top: 0;
  left: 0;
}

.wordmark {
  display: flex;
  align-items: baseline;
  gap: 2px;
  font-weight: 700;
  font-size: 17px;
  letter-spacing: -0.01em;
}

.wordmark__mark {
  font-size: 10px;
  transform: translateY(-6px);
  opacity: 0.9;
  color: var(--accent);
}

.nav-links {
  display: none;
  gap: clamp(20px, 2.6vw, 44px);
}

.nav-link {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  opacity: 0.6;
}

.nav-link:hover,
.nav-link.router-link-exact-active {
  opacity: 0.9;
}

.nav-toggle {
  display: flex;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px 0;
}

.nav-toggle span {
  display: block;
  width: 28px;
  height: 1.5px;
  background: var(--ink);
  transition: transform 0.35s ease;
}

.is-open-top {
  transform: translateY(3.25px) rotate(45deg);
}

.is-open-bottom {
  transform: translateY(-3.25px) rotate(-45deg);
}

.nav-drawer {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 18px var(--gutter) 26px;
  background: rgba(11, 12, 14, 0.94);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}

.nav-drawer__link {
  padding: 12px 0;
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  opacity: 0.75;
}

@media (min-width: 900px) {
  .nav-links {
    display: flex;
  }

  .nav-toggle,
  .nav-drawer {
    display: none;
  }
}
</style>
