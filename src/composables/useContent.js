import { ref, shallowRef, watch } from 'vue'
import { currentLocale } from '../i18n'
import { ApiError } from '../lib/api'

/**
 * Wraps a content fetch in the three states every page needs to handle now that
 * nothing is bundled at build time: pending, failed, and loaded.
 *
 * `pending` starts true so a page never flashes an empty layout before its first
 * response, and `reload` re-runs the same fetcher after a failure.
 */
export function useContent(fetcher, { initial = null, immediate = true } = {}) {
  const data = shallowRef(initial)
  const pending = ref(immediate)
  const error = ref(null)

  const load = async (...args) => {
    pending.value = true
    error.value = null

    try {
      data.value = await fetcher(...args, currentLocale())
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'Could not load this content.'
      data.value = initial
    } finally {
      pending.value = false
    }
  }

  if (immediate) load()

  return { data, pending, error, reload: load }
}

/**
 * Same, but re-fetches whenever the watched source changes — used by the gallery
 * when the active category filter changes.
 */
export function useContentFor(source, fetcher, options = {}) {
  const state = useContent(fetcher, { ...options, immediate: false })

  watch(
    source,
    (value) => state.reload(value),
    { immediate: true },
  )

  return state
}
