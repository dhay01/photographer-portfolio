import { onMounted, onBeforeUnmount } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Wires the shared page choreography onto a page root.
 *
 * Opt in per element with data attributes:
 *   data-reveal   intro stagger from above/below on mount
 *   data-fade     scroll-triggered rise + fade
 *   data-cross    slow floating loop (hero focus marks)
 *   data-bracket  scale-in on mount
 *   data-tile     hover zoom of its [data-tile-img] child
 */
export function useSiteMotion(rootRef) {
  let ctx

  onMounted(() => {
    const root = rootRef.value
    if (!root || prefersReducedMotion()) return

    ctx = gsap.context(() => {
      gsap.from('nav [data-reveal]', {
        y: -16,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.08,
        delay: 0.1,
      })

      gsap.from('[data-bracket]', {
        opacity: 0,
        scale: 0.8,
        transformOrigin: 'center',
        duration: 1.1,
        ease: 'power2.out',
        stagger: 0.08,
        delay: 0.2,
      })

      const reveals = root.querySelectorAll('section [data-reveal], header [data-reveal]')
      if (reveals.length) {
        gsap.from(reveals, {
          y: 34,
          opacity: 0,
          duration: 1.1,
          ease: 'power3.out',
          stagger: 0.09,
          delay: 0.25,
        })
      }

      root.querySelectorAll('[data-cross]').forEach((cross, i) => {
        gsap.to(cross, {
          y: '+=10',
          duration: 3 + i * 0.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      })

      root.querySelectorAll('[data-fade]').forEach((el) => {
        gsap.from(el, {
          y: 46,
          opacity: 0,
          duration: 1.05,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%' },
        })
      })

      root.querySelectorAll('[data-tile]').forEach((tile) => {
        const img = tile.querySelector('[data-tile-img]')
        if (!img) return
        tile.addEventListener('mouseenter', () =>
          gsap.to(img, { scale: 1.06, duration: 1.1, ease: 'power3.out' }),
        )
        tile.addEventListener('mouseleave', () =>
          gsap.to(img, { scale: 1, duration: 1.1, ease: 'power3.out' }),
        )
      })
    }, root)
  })

  onBeforeUnmount(() => ctx?.revert())
}

/**
 * Scroll-scrubbed parallax for the hero frame's slides.
 */
export function useHeroParallax(frameRef) {
  let ctx

  onMounted(() => {
    const frame = frameRef.value
    if (!frame || prefersReducedMotion()) return

    ctx = gsap.context(() => {
      gsap.to(frame.querySelectorAll('[data-slide]'), {
        yPercent: 12,
        ease: 'none',
        scrollTrigger: { trigger: frame, start: 'top top', end: 'bottom top', scrub: true },
      })
    }, frame)
  })

  onBeforeUnmount(() => ctx?.revert())
}
