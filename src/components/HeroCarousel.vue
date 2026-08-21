<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import ImageSlot from './ImageSlot.vue'
import { useHeroParallax } from '../composables/useSiteMotion'

const props = defineProps({
  slides: { type: Array, required: true },
  autoplaySeconds: { type: Number, default: 5 },
})

const frame = ref(null)
const active = ref(0)
let timer = null

const pad = (n) => String(n).padStart(2, '0')
const counter = computed(() => `${pad(active.value + 1)} / ${pad(props.slides.length)}`)

const go = (n) => {
  active.value = (n + props.slides.length) % props.slides.length
}

const start = () => {
  const secs = Math.max(2, props.autoplaySeconds)
  timer = setInterval(() => go(active.value + 1), secs * 1000)
}
const restart = () => {
  clearInterval(timer)
  start()
}

const step = (delta) => {
  go(active.value + delta)
  restart()
}

onMounted(start)
onBeforeUnmount(() => clearInterval(timer))

useHeroParallax(frame)
</script>

<template>
  <div ref="frame" class="hero-frame">
    <div
      v-for="(slide, i) in props.slides"
      :key="slide.src"
      data-slide
      class="hero-slide"
      :style="{ opacity: i === active ? 1 : 0, zIndex: i === active ? 2 : 1 }"
      :aria-hidden="i !== active"
    >
      <div class="hero-slide__kb">
        <ImageSlot :src="slide.src" :alt="slide.alt" fit="cover" />
      </div>
    </div>

    <div class="scrim scrim--v" />
    <div class="scrim scrim--h" />

    <div data-bracket class="bracket bracket--tl" />
    <div data-bracket class="bracket bracket--tr" />
    <div data-bracket class="bracket bracket--bl" />
    <div data-bracket class="bracket bracket--br" />

    <span data-cross class="cross" style="top: 34%; left: 16%; opacity: 0.75">+</span>
    <span data-cross class="cross" style="top: 58%; left: 40%; opacity: 0.7">+</span>
    <span data-cross class="cross" style="top: 30%; right: 30%; opacity: 0.65">+</span>

    <slot />

    <div class="hero-controls">
      <button data-prev aria-label="Previous slide" @click="step(-1)">&larr;</button>
      <button data-next aria-label="Next slide" @click="step(1)">&rarr;</button>
      <span class="hero-counter">{{ counter }}</span>
    </div>

    <div class="scroll-cue">
      Scroll
      <span class="scroll-cue__line" />
    </div>
  </div>
</template>

<style scoped>
.hero-frame {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.hero-slide {
  position: absolute;
  inset: 0;
  transition: opacity 1.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.hero-slide__kb {
  position: absolute;
  inset: 0;
  animation: gs-kb 9s ease-in-out infinite alternate;
}

.scrim {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
}

.scrim--v {
  background: linear-gradient(
    180deg,
    rgba(11, 12, 14, 0.55) 0%,
    rgba(11, 12, 14, 0.05) 26%,
    rgba(11, 12, 14, 0.08) 55%,
    rgba(11, 12, 14, 0.8) 100%
  );
}

.scrim--h {
  background: linear-gradient(90deg, rgba(11, 12, 14, 0.6) 0%, rgba(11, 12, 14, 0) 42%);
}

.cross {
  position: absolute;
  z-index: 6;
  font-family: var(--font-mono);
  font-size: 20px;
  color: var(--accent);
  pointer-events: none;
}

.hero-controls {
  position: absolute;
  right: var(--gutter);
  bottom: 26px;
  z-index: 7;
  display: flex;
  align-items: center;
  gap: 18px;
}

.hero-controls button {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid var(--line);
  background: rgba(11, 12, 14, 0.35);
  color: var(--ink);
  cursor: pointer;
  font-family: var(--font-sans);
  font-size: 17px;
  transition: background 0.35s ease;
}

.hero-controls button:hover {
  background: rgba(242, 240, 234, 0.1);
}

.hero-counter {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.1em;
  opacity: 0.8;
}

.scroll-cue {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 26px;
  z-index: 7;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: 0.2em;
  opacity: 0.6;
  text-transform: uppercase;
}

.scroll-cue__line {
  display: block;
  width: 1px;
  height: 26px;
  background: rgba(242, 240, 234, 0.5);
  animation: gs-scrollcue 2s ease-in-out infinite;
}

@media (max-width: 640px) {
  .scroll-cue {
    display: none;
  }
}
</style>
