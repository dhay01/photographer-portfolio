import { shallowRef } from 'vue'
import { getSite } from '../lib/api'
import { currentLocale } from '../i18n'

/**
 * Site settings are needed by the nav, both footers and several pages. Fetching
 * them per component would mean six identical requests per navigation, so the
 * promise is cached at module scope and shared.
 */
const site = shallowRef(null)
const error = shallowRef(null)
let inflight = null

export function useSite() {
  if (!inflight) {
    inflight = getSite(currentLocale())
      .then((data) => {
        site.value = data
        return data
      })
      .catch((e) => {
        error.value = e
        // Allow a later mount to retry rather than caching the failure forever.
        inflight = null
        return null
      })
  }

  return { site, error, ready: inflight }
}
