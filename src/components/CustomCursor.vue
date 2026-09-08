<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import gsap from 'gsap'

const dot = ref(null)
let cleanup = () => {}

onMounted(() => {
  const fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!fine || reduced || !dot.value) return

  const d = dot.value

  gsap.set(d, { xPercent: -50, yPercent: -50 })
  const dx = gsap.quickTo(d, 'x', { duration: 0.12, ease: 'power3' })
  const dy = gsap.quickTo(d, 'y', { duration: 0.12, ease: 'power3' })

  const onMove = (e) => {
    dx(e.clientX)
    dy(e.clientY)
    d.style.opacity = '1'
  }
  const onLeave = () => {
    d.style.opacity = '0'
  }

  window.addEventListener('mousemove', onMove)
  document.addEventListener('mouseleave', onLeave)

  cleanup = () => {
    window.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseleave', onLeave)
  }
})

onBeforeUnmount(() => cleanup())
</script>

<template>
  <div ref="dot" class="cursor-dot" aria-hidden="true" />
</template>

<style scoped>
.cursor-dot {
  position: fixed;
  top: 0;
  left: 0;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--ink);
  pointer-events: none;
  z-index: 1000;
  opacity: 0;
  mix-blend-mode: difference;
  transition: opacity 0.3s ease;
}

@media (hover: none), (pointer: coarse) {
  .cursor-dot {
    display: none;
  }
}
</style>
