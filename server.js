import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, join, normalize, resolve } from 'node:path'

// Serves the built `dist/` folder. The router uses createWebHistory(), so any
// path that isn't a real file has to fall back to index.html or a deep link
// like /blog/some-post would 404 on refresh.

const ROOT = resolve(import.meta.dirname, 'dist')
const PORT = Number(process.env.PORT) || 3000

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
}

/** Resolve a URL path to a file inside ROOT, or null if it escapes or is missing. */
async function resolveFile(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0])
  const candidate = resolve(join(ROOT, normalize(decoded)))

  // normalize() collapses ../ but a path could still point outside dist/.
  if (candidate !== ROOT && !candidate.startsWith(ROOT + '/')) return null

  try {
    const info = await stat(candidate)
    return info.isFile() ? candidate : null
  } catch {
    return null
  }
}

createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' }).end()
    return
  }

  let file = await resolveFile(req.url)
  let fallback = false

  if (!file) {
    file = join(ROOT, 'index.html')
    fallback = true
  }

  // Vite fingerprints everything under /assets/, so those can be cached hard.
  // index.html never is, otherwise a deploy wouldn't reach anyone holding a
  // stale copy that still points at the previous build's asset names.
  const cache =
    !fallback && req.url.startsWith('/assets/')
      ? 'public, max-age=31536000, immutable'
      : 'no-cache'

  res.writeHead(200, {
    'Content-Type': TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream',
    'Cache-Control': cache,
    'X-Content-Type-Options': 'nosniff',
  })

  if (req.method === 'HEAD') {
    res.end()
    return
  }

  createReadStream(file)
    .on('error', () => res.end())
    .pipe(res)
}).listen(PORT, '0.0.0.0', () => {
  console.log(`Serving dist/ on http://0.0.0.0:${PORT}`)
})
