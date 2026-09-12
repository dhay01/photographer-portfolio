<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ImageSlot from './ImageSlot.vue'

gsap.registerPlugin(ScrollTrigger)

const props = defineProps({
  photos: { type: Array, default: () => [] },
  // How far down the page the scatter starts and stops, in percent, so the
  // polaroids never collide with a hero or a footer.
  from: { type: Number, default: 14 },
  to: { type: Number, default: 88 },
})

const layer = ref(null)
let ctx

/**
 * Positions are derived from the index rather than Math.random so the scatter
 * is stable across re-renders, and alternate sides down the page. Everything
 * sits in the margins and hangs slightly off the edge — the page is the
 * subject, these are the things pinned around it.
 */
const placed = computed(() => {
  const list = props.photos.slice(0, 10)
  if (!list.length) return []

  const span = props.to - props.from
  const gap = list.length > 1 ? span / (list.length - 1) : 0

  return list.map((photo, i) => ({
    photo,
    side: i % 2 === 0 ? 'left' : 'right',
    // Nudge each one off its even slot so the two columns do not line up.
    top: props.from + gap * i + [0, -3.2, 2.4, -1.6, 3][i % 5],
    nudge: [0, -20, -38, -9, -28][i % 5],
    rotate: [-9, 7, -4, 11, -7, 5, -12, 8, -3, 6][i % 10],
    scale: [1, 0.82, 0.92, 0.76, 0.88][i % 5],
    depth: [1, 0.5, 0.8, 0.35, 0.65][i % 5],
  }))
})

watch(
  placed,
  async (list) => {
    ctx?.revert()
    ctx = null
    if (!list.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    await nextTick()
    const el = layer.value
    if (!el) return

    ctx = gsap.context(() => {
      el.querySelectorAll('[data-polaroid]').forEach((card) => {
        const depth = Number(card.dataset.depth)

        // The drift and the reveal are put on different elements on purpose:
        // two tweens writing a transform on one node overwrite each other, and
        // the drift is the one that silently loses.
        gsap.fromTo(
          card,
          { yPercent: 16 * depth },
          {
            yPercent: -22 * depth,
            ease: 'none',
            scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
          },
        )

        gsap.from(card.querySelector('[data-polaroid-inner]'), {
          y: 50,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 96%' },
        })
      })

      // Images land after the triggers are built and change the page height, so
      // the start/end positions have to be recomputed once they do.
      ScrollTrigger.refresh()
    }, el)
  },
  { immediate: true },
)

onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <div v-if="placed.length" ref="layer" class="scatter" aria-hidden="true">
    <figure
      v-for="(item, i) in placed"
      :key="item.photo.slug ?? i"
      data-polaroid
      :data-depth="item.depth"
      :class="['pola', `pola--${item.side}`]"
      :style="{
        top: `${item.top}%`,
        '--nudge': `${item.nudge}px`,
        '--rotate': `${item.rotate}deg`,
        '--scale': item.scale,
      }"
    >
      <div data-polaroid-inner class="pola__inner">
        <div class="pola__img">
          <ImageSlot
            :src="item.photo.images?.thumb ?? item.photo.images?.preview"
            :alt="item.photo.alt ?? item.photo.title"
            :placeholder="item.photo.title"
            fit="cover"
          />
        </div>
      </div>
    </figure>
  </div>
</template>

<style scoped>
.scatter {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  /* Cards hang off both edges; without this they widen the document and the
     whole page gains a horizontal scrollbar. */
  overflow: hidden;

  /* --gutter is the page's own left and right edge, so anchoring to it is what
     keeps a polaroid from ever ending up behind a paragraph: on a narrow screen
     they slide off-frame instead of onto the text. */
  --edge: var(--gutter);
}

.pola {
  position: absolute;
  width: calc(clamp(108px, 11vw, 186px) * var(--scale));
  margin: 0;
}

.pola--left {
  right: calc(100% - var(--edge) - var(--nudge) + 10px);
}

.pola--right {
  left: calc(100% - var(--edge) - var(--nudge) + 10px);
}

.pola__inner {
  padding: 8px 8px 30px;
  border-radius: 2px;
  background: #f4f2ec;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.5), 0 2px 5px rgba(0, 0, 0, 0.34);
  transform: rotate(var(--rotate));
}

.pola__img {
  position: relative;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: #d9d6cd;
}

/* The margins that make this work do not exist on a narrow screen — the cards
   would sit on top of the text instead of beside it. */
@media (max-width: 1100px) {
  .scatter {
    display: none;
  }
}
</style>
