<script setup>
import { ref, watch } from 'vue'

/**
 * Production stand-in for the design prototype's <image-slot>: fills its
 * positioned parent, and falls back to a labelled panel when no src is set
 * (e.g. the shop mockups) or when the file is missing — several source photos
 * still have to be dropped into public/uploads, so a 404 must degrade to the
 * placeholder rather than a broken image.
 */
const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
  fit: { type: String, default: 'cover' },
  position: { type: String, default: 'center' },
  placeholder: { type: String, default: '' },
})

const failed = ref(false)
watch(() => props.src, () => (failed.value = false))
</script>

<template>
  <img
    v-if="props.src && !failed"
    class="slot-img"
    :src="props.src"
    :alt="props.alt"
    loading="lazy"
    decoding="async"
    :style="{ objectFit: props.fit, objectPosition: props.position }"
    @error="failed = true"
  />
  <div v-else class="slot-empty">
    <span v-if="props.placeholder">{{ props.placeholder }}</span>
  </div>
</template>

<style scoped>
.slot-img,
.slot-empty {
  width: 100%;
  height: 100%;
}

.slot-empty {
  display: grid;
  place-items: center;
  padding: 16px;
  text-align: center;
  background: var(--panel);
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(242, 240, 234, 0.32);
}
</style>
