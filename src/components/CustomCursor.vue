<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import gsap from 'gsap'

const ring = ref(null)
const dot = ref(null)
let cleanup = () => {}

onMounted(() => {
  const fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!fine || reduced || !ring.value || !dot.value) return

  const r = ring.value
  const d = dot.value

  gsap.set([r, d], { xPercent: -50, yPercent: -50 })
  const rx = gsap.quickTo(r, 'x', { duration: 0.5, ease: 'power3' })
  const ry = gsap.quickTo(r, 'y', { duration: 0.5, ease: 'power3' })
  const dx = gsap.quickTo(d, 'x', { duration: 0.12, ease: 'power3' })
  const dy = gsap.quickTo(d, 'y', { duration: 0.12, ease: 'power3' })

  const onMove = (e) => {
    rx(e.clientX)
    ry(e.clientY)
    dx(e.clientX)
    dy(e.clientY)
    r.style.opacity = '1'
    d.style.opacity = '1'
  }
  const onLeave = () => {
    r.style.opacity = '0'
    d.style.opacity = '0'
  }

  // Grow the ring over anything interactive. Delegated so it keeps working
  // across route changes without re-binding per element.
  const interactive = 'a, button, [data-tile], input, [data-course]'
  const onOver = (e) => {
    if (!e.target.closest?.(interactive)) return
    r.style.width = '64px'
    r.style.height = '64px'
    r.style.background = 'rgba(242,240,234,.14)'
  }
  const onOut = (e) => {
    if (!e.target.closest?.(interactive)) return
    r.style.width = '36px'
    r.style.height = '36px'
    r.style.background = 'transparent'
  }

  window.addEventListener('mousemove', onMove)
  document.addEventListener('mouseleave', onLeave)
  document.addEventListener('mouseover', onOver)
  document.addEventListener('mouseout', onOut)

  cleanup = () => {
    window.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseleave', onLeave)
    document.removeEventListener('mouseover', onOver)
    document.removeEventListener('mouseout', onOut)
  }
})

onBeforeUnmount(() => cleanup())
</script>

<template>
  <div ref="ring" class="cursor-ring" aria-hidden="true" />
  <div ref="dot" class="cursor-dot" aria-hidden="true" />
</template>

<style scoped>
.cursor-ring,
.cursor-dot {
  position: fixed;
  top: 0;
  left: 0;
  border-radius: 50%;
  pointer-events: none;
  z-index: 1000;
  opacity: 0;
  mix-blend-mode: difference;
}

.cursor-ring {
  width: 36px;
  height: 36px;
  border: 1px solid var(--accent);
  transition: width 0.3s ease, height 0.3s ease, background 0.3s ease, opacity 0.3s ease;
}

.cursor-dot {
  width: 5px;
  height: 5px;
  background: var(--ink);
}

@media (hover: none), (pointer: coarse) {
  .cursor-ring,
  .cursor-dot {
    display: none;
  }
}
</style>
