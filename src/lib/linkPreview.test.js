import { test } from 'node:test'
import assert from 'node:assert/strict'
import { metaTags, previewFor, routeOf, summarise } from './linkPreview.js'

const site = {
  name: 'Ghaith Salih',
  tagline: '<p>Architecture, landscape &amp; gigapixel photography —</p>',
  author: { images: { preview: 'https://img/author.webp' } },
}
const slides = [{ images: { preview: 'https://img/slide.webp' } }]
const post = {
  title: 'AI for Photographers',
  excerpt: 'One day at The Station.',
  images: { preview: 'https://img/post.webp', share: 'https://img/post-share.jpg', original: 'https://img/post.jpg' },
}

/** A fake API: answers the paths it knows, null for anything else. */
const api = (records) => async (path) => records[path] ?? null
const known = { '/api/site': site, '/api/hero-slides': slides, '/api/posts/ai': post }

test('maps paths to the record they are about', () => {
  assert.deepEqual(routeOf('/'), { kind: 'site' })
  assert.deepEqual(routeOf('/about/'), { kind: 'section', name: 'About' })
  assert.deepEqual(routeOf('/pricing'), { kind: 'pricing' })
  assert.deepEqual(routeOf('/blog/ai'), { kind: 'post', slug: 'ai' })
  assert.deepEqual(routeOf('/courses/image-design'), { kind: 'course', slug: 'image-design' })
  assert.deepEqual(routeOf('/work/architecture'), { kind: 'category', slug: 'architecture' })
})

test('never builds an API path from an odd slug', () => {
  assert.deepEqual(routeOf('/blog/..%2Fsite'), { kind: 'site' })
  assert.deepEqual(routeOf('/blog/a/b'), { kind: 'site' })
  assert.deepEqual(routeOf('/nope'), { kind: 'site' })
})

test('the home page uses the site tagline and first hero photo', async () => {
  const preview = await previewFor('/', api(known))

  assert.equal(preview.title, 'Ghaith Salih')
  assert.equal(preview.description, 'Architecture, landscape & gigapixel photography —')
  assert.equal(preview.image, 'https://img/slide.webp')
})

test('a post uses its own title, excerpt and image', async () => {
  const preview = await previewFor('/blog/ai', api(known))

  assert.equal(preview.title, 'AI for Photographers · Ghaith Salih')
  assert.equal(preview.description, 'One day at The Station.')
  assert.equal(preview.image, 'https://img/post-share.jpg')
  assert.equal(preview.type, 'article')
})

test('falls back to the preview rendition when there is no share size', async () => {
  const preview = await previewFor('/', api(known))
  assert.equal(preview.image, 'https://img/slide.webp')
})

test('a record that fails to load falls back to the site preview', async () => {
  const preview = await previewFor('/blog/missing', api(known))
  assert.equal(preview.title, 'Ghaith Salih')

  const offline = await previewFor('/blog/ai', api({}))
  assert.equal(offline.title, 'Ghaith Salih')
  assert.equal(offline.image, null)
})

test('the pricing page previews in Arabic', async () => {
  const preview = await previewFor('/pricing', api(known))
  assert.equal(preview.title, 'حاسبة السعر · Ghaith Salih')
  assert.equal(preview.locale, 'ar_IQ')
})

test('meta tags escape API text and skip empty values', () => {
  const html = metaTags(
    { title: 'A "quote" <script>', description: '', image: null, type: 'website', locale: 'en_US' },
    'https://ghaithsalih.com/x',
  )

  assert.ok(html.includes('content="A &quot;quote&quot; &lt;script&gt;"'))
  assert.ok(!html.includes('<script>'))
  assert.ok(!html.includes('og:image'))
  assert.ok(!html.includes('og:description'))
  assert.ok(html.includes('content="summary"'))
})

test('long descriptions are cut at a word', () => {
  const text = summarise('word '.repeat(100), 30)
  assert.ok(text.length <= 30)
  assert.ok(text.endsWith('word…'))
})
