/**
 * Pick a web-sized derivative. Never the archive original — that file can be
 * hundreds of megabytes and must not land in an <img>.
 */
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
