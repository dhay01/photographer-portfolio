<script setup>
import { computed } from 'vue'
import GrainOverlay from './components/GrainOverlay.vue'
import CustomCursor from './components/CustomCursor.vue'
import { useSite } from './composables/useSite'

/**
 * Every page reads site settings, so a failure here means the API is unreachable
 * rather than one endpoint being wrong. Without this the whole site renders as
 * empty sections with no clue why, which is a slow thing to debug — but it is a
 * developer's problem, never a visitor's, so it is stripped from the build.
 */
const { error } = useSite()
const apiUrl = import.meta.env.VITE_API_URL || '(VITE_API_URL is not set)'
const apiDown = computed(() => import.meta.env.DEV && !!error.value)
</script>

<template>
  <GrainOverlay />
  <CustomCursor />

  <div v-if="apiDown" class="api-down">
    <span class="api-down__title">The API is not answering.</span>
    <span>Every section will stay empty until it is running.</span>
    <code class="api-down__url">{{ apiUrl }}</code>
    <code class="api-down__fix">cd ../ghaith-salih-api &amp;&amp; php artisan serve --port=8123</code>
  </div>

  <RouterView />
</template>

<style scoped>
.api-down {
  position: fixed;
  left: 50%;
  bottom: 18px;
  transform: translateX(-50%);
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: min(92vw, 620px);
  padding: 14px 18px;
  border: 1px solid rgba(246, 139, 43, 0.5);
  border-radius: 10px;
  background: rgba(11, 12, 14, 0.94);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  font-family: var(--font-mono);
  font-size: 11px;
  line-height: 1.6;
  color: rgba(242, 240, 234, 0.75);
}

.api-down__title {
  color: var(--accent);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.api-down__url,
.api-down__fix {
  padding: 6px 9px;
  border-radius: 5px;
  background: rgba(242, 240, 234, 0.06);
  font-size: 10.5px;
  overflow-wrap: anywhere;
}
</style>
