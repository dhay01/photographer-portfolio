/**
 * A tab opened before a deploy still runs the old build. Its pages and the
 * deep-zoom viewer are loaded on demand from fingerprinted chunks, and those
 * chunks are gone once the new build is live — so the next click fails with
 * a module error and the page goes nowhere.
 *
 * Reloading picks up the new build. A failed route navigation reloads straight
 * onto the page the visitor was going to; any other failed chunk reloads the
 * page they are on. A short cooldown stops a loop if a chunk is genuinely
 * broken rather than stale.
 */

export const RELOAD_KEY = 'stale-build-reload-at'
export const RELOAD_COOLDOWN_MS = 10_000

// Chrome, Firefox and Safari word this differently; Vite adds its own for CSS.
const CHUNK_ERROR =
  /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|Unable to preload CSS/i

export const isChunkError = (error) => CHUNK_ERROR.test(error?.message ?? '')

/** Storage can throw (private mode, blocked site data); treat that as "never reloaded". */
const readStamp = (storage) => {
  try {
    return Number(storage.getItem(RELOAD_KEY)) || 0
  } catch {
    return 0
  }
}

const writeStamp = (storage, now) => {
  try {
    storage.setItem(RELOAD_KEY, String(now))
  } catch {
    // Without storage there is no loop guard across reloads; the reload still helps.
  }
}

/** Navigates to `url` unless a reload already happened within the cooldown. */
export const reloadOnce = (url, { storage, location, now = Date.now() }) => {
  const last = readStamp(storage)
  if (last && now - last < RELOAD_COOLDOWN_MS) return false

  writeStamp(storage, now)
  location.assign(url)
  return true
}

export const installStaleBuildRecovery = (router) => {
  const env = () => ({ storage: window.sessionStorage, location: window.location })

  router.onError((error, to) => {
    if (isChunkError(error)) reloadOnce(to.fullPath, env())
  })

  // Vite raises this for any failed lazy import, routes included. Deferred a
  // tick so a route failure reloads onto its destination first and this one
  // is then held back by the cooldown.
  window.addEventListener('vite:preloadError', () => {
    setTimeout(() => reloadOnce(window.location.href, env()), 0)
  })
}
