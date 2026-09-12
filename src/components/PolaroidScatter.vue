<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ImageSlot from './ImageSlot.vue'

gsap.registerPlugin(ScrollTrigger)

const props = defineProps({
  photos: { type: Array, default: () => [] },
  // Shifts the scatter pattern so two bands on the same page don't rhyme.
  seed: { type: Number, default: 0 },
  limit: { type: Number, default: 6 },
})

const band = ref(null)
let ctx

/**
 * The scatter is derived from the index rather than Math.random so a re-render
 * never reshuffles the band under the reader, and so the layout is identical
 * between the server-rendered markup and the client.
 *
 * `depth` drives both the parallax distance and the stacking order: the further
 * a polaroid travels, the closer to the front it sits.
 */
const scattered = computed(() =>
  props.photos.slice(0, props.limit).map((photo, i) => {
    const n = i + props.seed
    return {
      photo,
      rotate: [-7, 5, -3, 8, -5, 3, -8, 6][n % 8],
      drop: [0, 34, 12, 48, 6, 28][n % 6],
      depth: [1, 0.55, 0.85, 0.4, 1, 0.7][n % 6],
      width: [1, 0.86, 0.94, 0.8, 1, 0.9][n % 6],
    }
  }),
)

/**
 * Set up on the photos arriving rather than on mount: the band is behind a
 * v-if, so at mount time there is no element to attach a trigger to and the
 * whole effect silently does nothing.
 */
watch(scattered, async (list) => {
  ctx?.revert()
  ctx = null
  if (!list.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  await nextTick()
  const el = band.value
  if (!el) return

  ctx = gsap.context(() => {
    el.querySelectorAll('[data-polaroid]').forEach((card) => {
      const depth = Number(card.dataset.depth)

      // The drift and the reveal are put on different elements on purpose: two
      // tweens writing a transform on one node overwrite each other, and the
      // drift is the one that silently loses.
      gsap.fromTo(
        card,
        { yPercent: 6 * depth },
        {
          yPercent: -16 * depth,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.6,
          },
        },
      )

      gsap.from(card.querySelector('[data-polaroid-inner]'), {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: card, start: 'top 94%' },
      })
    })

    // Images land after the triggers are built and change the page height, so
    // the start/end positions have to be recomputed once they do.
    ScrollTrigger.refresh()
  }, el)
}, { immediate: true })

onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <div v-if="scattered.length" ref="band" class="band" aria-hidden="true">
    <figure
      v-for="(item, i) in scattered"
      :key="item.photo.slug ?? i"
      data-polaroid
      :data-depth="item.depth"
      class="pola"
      :style="{
        '--rotate': `${item.rotate}deg`,
        '--drop': `${item.drop}px`,
        '--scale': item.width,
        zIndex: Math.round(item.depth * 10),
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
.band {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: clamp(30px, 5vw, 70px) 0 clamp(50px, 7vw, 100px);
  perspective: 900px;
}

.pola {
  flex: 0 0 auto;
  width: calc(clamp(130px, 15vw, 230px) * var(--scale));
  margin-top: var(--drop);
  /* flexbox rejects a negative gap, so the overlap is a pull on each sibling;
     the rotations then break up the seam. */
  margin-inline-start: clamp(-42px, -3vw, -16px);
}

.pola__inner {
  padding: 9px 9px 34px;
  border-radius: 2px;
  background: #f4f2ec;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45), 0 2px 6px rgba(0, 0, 0, 0.3);
  transform: rotate(var(--rotate));
  transition: transform 0.6s cubic-bezier(0.2, 0, 0.1, 1);
}

.pola:first-child {
  margin-inline-start: 0;
}

.pola:hover {
  z-index: 20;
}

.pola:hover .pola__inner {
  transform: rotate(0deg) translateY(-6px);
}

.pola__img {
  position: relative;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: #d9d6cd;
}

/* The band is decorative; below the fold of a phone it becomes a cramped row,
   so the deepest few drop out rather than shrinking to thumbnails. */
@media (max-width: 900px) {
  .pola:nth-child(n + 5) {
    display: none;
  }
}

@media (max-width: 560px) {
  .pola:nth-child(n + 4) {
    display: none;
  }

  .pola__inner {
    padding: 7px 7px 26px;
  }
}
</style>
