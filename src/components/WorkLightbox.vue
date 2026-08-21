<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  items: { type: Array, required: true },
  position: { type: Number, required: true },
})

const emit = defineEmits(['close', 'step'])

const zoomOpen = ref(false)
const current = computed(() => props.items[props.position] ?? null)
const counter = computed(
  () =>
    `${String(props.position + 1).padStart(2, '0')} / ${String(props.items.length).padStart(2, '0')}`,
)

// A new photo invalidates the deep-zoom view.
watch(() => props.position, () => (zoomOpen.value = false))

const onKey = (e) => {
  if (e.key === 'Escape') {
    if (zoomOpen.value) zoomOpen.value = false
    else emit('close')
  } else if (!zoomOpen.value && e.key === 'ArrowRight') emit('step', 1)
  else if (!zoomOpen.value && e.key === 'ArrowLeft') emit('step', -1)
}

onMounted(() => {
  window.addEventListener('keydown', onKey)
  document.body.style.overflow = 'hidden'
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>

<template>
  <div v-if="current" class="lb" role="dialog" aria-modal="true" :aria-label="current.title">
    <div class="lb__bar">
      <span class="mono lb__counter">{{ counter }}</span>
      <button class="round round--sm" aria-label="Close" @click="emit('close')">&times;</button>
    </div>

    <div class="lb__body">
      <button class="round" aria-label="Previous" @click="emit('step', -1)">&larr;</button>

      <div class="lb__stage">
        <div class="lb__frame">
          <img v-if="current.src" :src="current.src" :alt="current.title" class="lb__img" />
          <div v-else class="lb__ph mono">Image placeholder</div>
        </div>

        <div class="lb__meta">
          <div>
            <div class="lb__title">{{ current.title }}</div>
            <div class="lb__cat mono">{{ current.cat }}</div>
          </div>

          <div class="lb__facts">
            <div>
              <div class="lb__label mono">Location</div>
              <div class="lb__value">{{ current.loc }}</div>
            </div>
            <div>
              <div class="lb__label mono">Gear</div>
              <div class="lb__value">{{ current.gear }}</div>
            </div>
          </div>

          <button v-if="current.zoom" class="zoom-cta mono" @click="zoomOpen = true">
            &#10530; Enter deep-zoom
          </button>
        </div>
      </div>

      <button class="round" aria-label="Next" @click="emit('step', 1)">&rarr;</button>
    </div>
  </div>

  <div v-if="zoomOpen && current" class="dz">
    <div class="dz__bar">
      <div class="dz__title">
        <span class="mono dz__kicker">&#10530; Gigapixel deep-zoom</span>
        <span class="mono dz__name">{{ current.title }}</span>
      </div>
      <button class="round round--sm" aria-label="Close" @click="zoomOpen = false">&times;</button>
    </div>

    <div class="dz__stage">
      <img v-if="current.src" :src="current.src" :alt="current.title" class="dz__img" />
      <div class="dz__vignette" />
      <div class="dz__reticle" />
      <div class="dz__controls mono">
        <span class="dz__hint">drag to explore</span>
        <span class="dz__sep" />
        <span class="dz__knob">&minus;</span>
        <span class="dz__knob dz__knob--on">+</span>
      </div>
    </div>

    <div class="dz__foot mono">
      Preview only &mdash; production mounts an OpenSeadragon tile pyramid for true gigapixel pan
      &amp; zoom.
    </div>
  </div>
</template>

<style scoped>
.lb {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(8, 9, 11, 0.94);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  flex-direction: column;
}

.lb__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px clamp(20px, 3vw, 44px);
  flex: none;
}

.lb__counter {
  font-size: 12px;
  letter-spacing: 0.12em;
  opacity: 0.8;
}

.round {
  width: 50px;
  height: 50px;
  flex: none;
  border-radius: 50%;
  border: 1px solid var(--line);
  background: rgba(11, 12, 14, 0.4);
  color: var(--ink);
  cursor: pointer;
  font-size: 18px;
  transition: background 0.3s ease, border-color 0.3s ease;
}

.round:hover {
  background: rgba(242, 240, 234, 0.1);
  border-color: var(--line-strong);
}

.round--sm {
  width: 44px;
  height: 44px;
  font-size: 19px;
  background: transparent;
}

.lb__body {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(16px, 3vw, 40px);
  padding: 0 clamp(20px, 3vw, 44px) clamp(20px, 3vw, 40px);
}

.lb__stage {
  flex: 1;
  height: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
}

.lb__frame {
  position: relative;
  max-width: 100%;
  max-height: 72vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lb__img {
  max-width: 100%;
  max-height: 72vh;
  object-fit: contain;
  border-radius: 6px;
}

.lb__ph {
  width: min(70vw, 720px);
  aspect-ratio: 3 / 2;
  border: 1px dashed var(--line);
  border-radius: 8px;
  display: grid;
  place-items: center;
  font-size: 12px;
  letter-spacing: 0.1em;
  opacity: 0.5;
  text-transform: uppercase;
}

.lb__meta {
  display: flex;
  align-items: center;
  gap: clamp(20px, 3vw, 48px);
  flex-wrap: wrap;
  justify-content: center;
  text-align: center;
}

.lb__title {
  font-size: clamp(18px, 1.8vw, 24px);
  font-weight: 500;
  letter-spacing: -0.01em;
}

.lb__cat {
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--accent);
  margin-top: 6px;
}

.lb__facts {
  display: flex;
  gap: clamp(18px, 2.5vw, 40px);
  text-align: left;
}

.lb__label {
  font-size: 9.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.45;
  margin-bottom: 5px;
}

.lb__value {
  font-size: 14px;
  opacity: 0.9;
}

.zoom-cta {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 12px 22px;
  border: 1px solid var(--accent);
  border-radius: 100px;
  background: rgba(246, 139, 43, 0.1);
  color: var(--accent);
  cursor: pointer;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.zoom-cta:hover {
  background: rgba(246, 139, 43, 0.2);
}

/* ---------- deep zoom ---------- */

.dz {
  position: fixed;
  inset: 0;
  z-index: 2100;
  background: #060708;
  display: flex;
  flex-direction: column;
}

.dz__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px clamp(20px, 3vw, 44px);
  flex: none;
  border-bottom: 1px solid var(--line);
}

.dz__title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dz__kicker {
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--accent);
}

.dz__name {
  font-size: 11px;
  opacity: 0.5;
}

.dz__stage {
  flex: 1;
  min-height: 0;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dz__img {
  min-width: 130%;
  min-height: 130%;
  object-fit: cover;
  filter: saturate(1.05);
}

.dz__vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  box-shadow: inset 0 0 200px rgba(0, 0, 0, 0.6);
}

.dz__reticle {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  border: 1px solid rgba(246, 139, 43, 0.4);
  border-radius: 6px;
  pointer-events: none;
}

.dz__controls {
  position: absolute;
  bottom: 22px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 18px;
  border-radius: 100px;
  background: rgba(11, 12, 14, 0.6);
  border: 1px solid var(--line);
  font-size: 10.5px;
  letter-spacing: 0.1em;
  opacity: 0.85;
}

.dz__hint {
  opacity: 0.6;
}

.dz__sep {
  width: 1px;
  height: 14px;
  background: var(--line);
}

.dz__knob {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: 1px solid var(--line);
  border-radius: 50%;
}

.dz__knob--on {
  border-color: var(--accent);
  color: var(--accent);
}

.dz__foot {
  flex: none;
  padding: 12px clamp(20px, 3vw, 44px);
  border-top: 1px solid var(--line);
  font-size: 10px;
  letter-spacing: 0.06em;
  opacity: 0.4;
  text-align: center;
}

@media (max-width: 760px) {
  .lb__body > .round {
    display: none;
  }

  .lb__facts {
    justify-content: center;
  }
}
</style>
