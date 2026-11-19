/**
 * Runs on /assets/* only (Pages builds the route list from this folder).
 *
 * A file Vite fingerprinted into /assets/ that is not in this deployment — an
 * old tab asking for last build's chunk, or a request that lands mid-rollout —
 * falls through to the SPA rule in _redirects and comes back as index.html with
 * a 200. _headers then marks it immutable for a year, so the browser keeps an
 * HTML page under a .css or .js address and the site stays unstyled for that
 * visitor. Answer those with an uncacheable 404 instead, so the next request
 * fetches the real file.
 */
export const onRequest = async ({ next }) => {
  const response = await next()
  const type = response.headers.get('Content-Type') ?? ''

  if (!type.startsWith('text/html')) return response

  return new Response('Not found', {
    status: 404,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}
