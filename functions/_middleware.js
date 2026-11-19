/**
 * Runs on every request. For the app's HTML it fills in the page title and the
 * Open Graph / Twitter tags that link previews read (WhatsApp, Telegram,
 * iMessage…), since those apps never run the app itself. Anything else passes
 * straight through.
 *
 * A slow or failing API must never cost the visitor the page: lookups time out
 * quickly and any error sends the HTML as it was.
 */
import { metaTags, previewFor } from '../src/lib/linkPreview.js'

const API = 'https://api.ghaith-art.com'
const API_TIMEOUT_MS = 1500
// Edge-cached so a burst of shares costs the API one lookup, not one per request.
const API_CACHE_SECONDS = 600

const apiJson = (base) => async (path) => {
  try {
    const response = await fetch(`${base}${path}`, {
      headers: { Accept: 'application/json', 'Accept-Language': 'en' },
      cf: { cacheTtl: API_CACHE_SECONDS, cacheEverything: true },
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    })
    if (!response.ok) return null
    const body = await response.json()
    return body?.data ?? null
  } catch {
    return null
  }
}

export const onRequest = async ({ request, next, env }) => {
  const response = await next()
  const type = response.headers.get('Content-Type') ?? ''
  if (request.method !== 'GET' || !type.startsWith('text/html')) return response

  try {
    const url = new URL(request.url)
    const preview = await previewFor(url.pathname, apiJson(env.API_URL ?? API))
    const canonical = `${url.origin}${url.pathname}`

    return new HTMLRewriter()
      .on('title', { element: (el) => el.setInnerContent(preview.title) })
      .on('head', { element: (el) => el.append(metaTags(preview, canonical), { html: true }) })
      .transform(response)
  } catch (error) {
    console.error('link preview failed', error)
    return response
  }
}
