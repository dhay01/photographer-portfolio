<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useSite } from '../composables/useSite'
import { LOCALES, setLocale } from '../i18n'

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

const { locale } = useI18n()

/**
 * Disabled until the Arabic content exists: the interface strings are ready in
 * ar.json but every translatable field in the database is still English-only, so
 * switching would show a half-translated site.
 *
 * Removing `disabled` on the buttons below is all that is needed to turn it on —
 * the handler is already wired.
 */
const languageEnabled = false

const switchTo = (code) => {
  if (!languageEnabled || code === locale.value) return
  setLocale(code)
}

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

    <div
      data-reveal
      class="lang"
      role="group"
      :aria-label="$t('nav.language')"
      :title="languageEnabled ? null : $t('nav.languageSoon')"
    >
      <button
        v-for="option in LOCALES"
        :key="option.code"
        type="button"
        class="lang__option"
        :class="{ 'lang__option--on': option.code === locale }"
        :disabled="!languageEnabled"
        :aria-disabled="!languageEnabled"
        :aria-pressed="option.code === locale"
        :lang="option.code"
        @click="switchTo(option.code)"
      >
        {{ option.label }}
      </button>
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

      <div
        class="lang lang--drawer"
        role="group"
        :aria-label="$t('nav.language')"
        :title="languageEnabled ? null : $t('nav.languageSoon')"
      >
        <button
          v-for="option in LOCALES"
          :key="option.code"
          type="button"
          class="lang__option"
          :class="{ 'lang__option--on': option.code === locale }"
          :disabled="!languageEnabled"
          :aria-disabled="!languageEnabled"
          :aria-pressed="option.code === locale"
          :lang="option.code"
          @click="switchTo(option.code)"
        >
          {{ option.label }}
        </button>
      </div>
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

.lang {
  display: none;
  align-items: center;
  gap: 2px;
  padding: 3px;
  border: 1px solid var(--line);
  border-radius: 999px;
}

.lang__option {
  min-width: 30px;
  padding: 4px 8px;
  border: none;
  border-radius: 999px;
  background: none;
  color: inherit;
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.45;
  cursor: pointer;
  transition: opacity 0.2s ease, background 0.2s ease;
}

.lang__option--on {
  background: rgba(242, 240, 234, 0.08);
  opacity: 0.85;
}

.lang__option:disabled {
  cursor: not-allowed;
}

/* Dimmed as a whole while the feature is off, rather than per button, so the
   active locale still reads as the current one. */
.lang:has(.lang__option:disabled) {
  opacity: 0.5;
}

.lang--drawer {
  display: inline-flex;
  align-self: flex-start;
  margin-top: 14px;
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

  .lang {
    display: inline-flex;
  }

  .lang--drawer {
    display: none;
  }

  .nav-toggle,
  .nav-drawer {
    display: none;
  }
}
</style>
