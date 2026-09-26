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
 *   data-sign     handwritten mark, wiped on left to right as if written
 */
export function useSiteMotion(rootRef) {
  let ctx
  let observer

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

      // Everything below animates on scroll or on hover, and page content
      // arrives from the API after mount — so anything inside a v-if or v-for
      // is missing from this first pass. These are wired again whenever the
      // tree changes, and each element is marked so it is only wired once.
      // The on-load stagger above is deliberately not re-run: it belongs to the
      // page's entrance, not to whatever shows up later.
      let crossIndex = 0

      const wire = (selector, setup) => {
        root.querySelectorAll(selector).forEach((el) => {
          if (el.dataset.motionReady) return
          el.dataset.motionReady = '1'
          setup(el)
        })
      }

      const wireAll = () => {
        wire('[data-cross]', (cross) => {
          gsap.to(cross, {
            y: '+=10',
            // Staggered periods so several marks never drift in lockstep.
            duration: 3 + (crossIndex++ * 0.5),
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          })
        })

        wire('[data-fade]', (el) => {
          gsap.from(el, {
            y: 46,
            opacity: 0,
            duration: 1.05,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%' },
          })
        })

        // A signature reads better written than faded in, so it is uncovered
        // left to right at roughly pen speed. Driven from the hidden state by
        // GSAP rather than from CSS, so the mark stays visible for anyone who
        // has asked for reduced motion and never reaches this block.
        wire('[data-sign]', (el) => {
          gsap.fromTo(
            el,
            { clipPath: 'inset(0 100% 0 0)' },
            {
              clipPath: 'inset(0 0% 0 0)',
              duration: 1.6,
              ease: 'power2.inOut',
              delay: 0.35,
              scrollTrigger: { trigger: el, start: 'top 92%' },
            },
          )
        })

        wire('[data-tile]', (tile) => {
          const img = tile.querySelector('[data-tile-img]')
          if (!img) return
          tile.addEventListener('mouseenter', () =>
            gsap.to(img, { scale: 1.06, duration: 1.1, ease: 'power3.out' }),
          )
          tile.addEventListener('mouseleave', () =>
            gsap.to(img, { scale: 1, duration: 1.1, ease: 'power3.out' }),
          )
        })
      }

      wireAll()

      // Coalesced to one pass per frame: a list rendering fifty cards fires the
      // observer fifty times, and each pass walks the whole subtree.
      let queued = false
      observer = new MutationObserver(() => {
        if (queued) return
        queued = true
        requestAnimationFrame(() => {
          queued = false
          ctx.add(wireAll)
        })
      })
      observer.observe(root, { childList: true, subtree: true })

    }, root)
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    ctx?.revert()
  })
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
