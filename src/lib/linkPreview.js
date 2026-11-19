/**
 * What a shared link shows in WhatsApp, Telegram, iMessage and the like.
 *
 * Those apps read the HTML as sent and never run the app, so the titles that
 * usePageTitle sets in the browser never reach them. The Pages middleware asks
 * this module for a page's title, description and image and writes them into
 * the HTML before it leaves the edge.
 *
 * Lives under src/ because every file in functions/ becomes a Pages route.
 */
import { SITE_NAME, formatTitle } from '../composables/usePageTitle.js'

const SECTIONS = {
  '/about': 'About',
  '/work': 'Work',
  '/courses': 'Courses',
  '/blog': 'Blog',
}

const PRICING = {
  title: 'حاسبة السعر',
  description: 'احسب أقل سعر لجلسة التصوير بثلاث خطوات.',
  locale: 'ar_IQ',
}

const DESCRIPTION_MAX = 200

const stripHtml = (html = '') =>
  String(html)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()

/** Plain text cut at a word, so a long excerpt doesn't end mid-word. */
export const summarise = (text, max = DESCRIPTION_MAX) => {
  const plain = stripHtml(text).replace(/\*\*/g, '')
  if (plain.length <= max) return plain
  const cut = plain.slice(0, max - 1)
  return `${cut.slice(0, cut.lastIndexOf(' ') > 0 ? cut.lastIndexOf(' ') : cut.length)}…`
}

/** The original JPG reads everywhere; the WebP renditions stand in when it's missing. */
const imageOf = (images) => images?.original ?? images?.full ?? images?.preview ?? null

const SLUG = /^[a-z0-9-]+$/i

/** Which API record, if any, a path is about. */
export const routeOf = (pathname) => {
  const path = pathname.replace(/\/+$/, '') || '/'
  const [, section, slug, extra] = path.split('/')
  if (extra !== undefined || (slug !== undefined && !SLUG.test(slug))) return { kind: 'site' }
  if (slug) {
    if (section === 'work') return { kind: 'category', slug }
    if (section === 'courses') return { kind: 'course', slug }
    if (section === 'blog') return { kind: 'post', slug }
    return { kind: 'site' }
  }
  if (path === '/pricing') return { kind: 'pricing' }
  if (SECTIONS[path]) return { kind: 'section', name: SECTIONS[path] }
  return { kind: 'site' }
}

/**
 * Resolves a page's preview. `getJson(path)` returns the API's `data` or null;
 * any record that fails to load falls back to the site-wide preview.
 */
export const previewFor = async (pathname, getJson) => {
  const route = routeOf(pathname)
  const [site, slides] = await Promise.all([getJson('/api/site'), getJson('/api/hero-slides')])

  const base = {
    title: SITE_NAME,
    description: summarise(site?.tagline ?? site?.author?.bio ?? ''),
    image: imageOf(slides?.[0]?.images) ?? imageOf(site?.author?.images),
    type: 'website',
    locale: 'en_US',
  }
  const page = (name, extra = {}) => ({ ...base, ...extra, title: formatTitle(name) })

  if (route.kind === 'section') return page(route.name)
  if (route.kind === 'pricing') return page(PRICING.title, PRICING)

  if (route.kind === 'post') {
    const post = await getJson(`/api/posts/${route.slug}`)
    if (!post) return base
    return page(post.title, {
      description: summarise(post.excerpt ?? post.standfirst) || base.description,
      image: imageOf(post.images) ?? base.image,
      type: 'article',
    })
  }

  if (route.kind === 'course') {
    const course = await getJson(`/api/workshops/${route.slug}`)
    if (!course) return base
    return page(course.title, {
      description: summarise(course.overview) || base.description,
      image: imageOf(course.images) ?? base.image,
    })
  }

  if (route.kind === 'category') {
    const category = (await getJson('/api/categories?type=work'))?.find((c) => c.slug === route.slug)
    if (!category) return base
    return page(category.name, {
      description: `${category.name} photography by ${SITE_NAME}.`,
      image: imageOf(category.images) ?? base.image,
    })
  }

  return base
}

const escapeAttr = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

/** The tags appended to <head>. Every value is escaped: it comes from the API. */
export const metaTags = (preview, url) => {
  const tags = [
    ['name', 'description', preview.description],
    ['property', 'og:site_name', SITE_NAME],
    ['property', 'og:type', preview.type],
    ['property', 'og:locale', preview.locale],
    ['property', 'og:url', url],
    ['property', 'og:title', preview.title],
    ['property', 'og:description', preview.description],
    ['property', 'og:image', preview.image],
    ['name', 'twitter:card', preview.image ? 'summary_large_image' : 'summary'],
    ['name', 'twitter:title', preview.title],
    ['name', 'twitter:description', preview.description],
    ['name', 'twitter:image', preview.image],
  ]
  return tags
    .filter(([, , content]) => content)
    .map(([attr, key, content]) => `<meta ${attr}="${key}" content="${escapeAttr(content)}" />`)
    .join('\n    ')
}
