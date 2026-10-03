/**
 * Pick a web-sized derivative. Never the archive original — that file can be
 * hundreds of megabytes and must not land in an <img>.
 */
/** "3/2" as a number. The API sends each frame's measured shape this way. */
export function ratioOf(ratio, fallback = 1.5) {
  const [w, h] = String(ratio ?? '').split('/').map(Number)
  return w > 0 && h > 0 ? w / h : fallback
}

export function webSrc(images, size = 'preview') {
  if (!images) return ''

  const order =
    size === 'thumb'
      ? ['thumb', 'preview', 'full']
      : size === 'full'
        ? ['full', 'preview', 'thumb']
        : ['preview', 'thumb', 'full']

  for (const key of order) {
    const url = images[key]
    if (url && url !== images.original) return url
  }

  return ''
}
