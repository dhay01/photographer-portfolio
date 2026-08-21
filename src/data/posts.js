import { photos } from './photos'

export const author = {
  name: 'Ghaith Salih',
  location: 'Baghdad',
  photo: photos.portraitStudy,
  bio: 'Landscape, panorama & gigapixel photographer based in Baghdad. Writing between shoots.',
  follow: 'https://www.instagram.com/ghaith_salih/',
}

/**
 * Article bodies are block arrays so the post template can render any post
 * without bespoke markup: `text`, `heading`, `figure`, `quote`.
 */
export const posts = [
  {
    slug: 'chasing-fog-zagros',
    featured: true,
    cat: 'Behind the scenes',
    date: 'Feb 2026',
    read: '8 min read',
    src: photos.ranges,
    title: 'Chasing fog in the Zagros — three cold mornings for one frame',
    excerpt:
      'The light I wanted only exists for about eight minutes after sunrise, when the valley fog hasn’t burned off yet. Here’s what it took to be standing in the right place when it happened.',
    standfirst:
      'The light I wanted only exists for about eight minutes after sunrise. Here’s what it took to be standing in the right place when it happened.',
    tags: ['Landscape', 'Fieldcraft', 'Zagros'],
    body: [
      {
        type: 'text',
        paragraphs: [
          'I’d seen the frame in my head for two years before I made it: a ridge of dark pines dissolving into valley fog, the first sun just catching the top of the range. The problem with a picture that lives in your head is that the world rarely agrees to build it for you.',
          'So I went back. Three mornings, the same trailhead, the same forty-minute climb in the dark to be set up before the light. The first two mornings gave me nothing — clear skies, no fog, flat light. Photography outdoors is mostly the patience to be wrong on schedule.',
        ],
      },
      { type: 'heading', text: 'Reading the night before' },
      {
        type: 'text',
        paragraphs: [
          'Fog isn’t luck — it’s a forecast you learn to read. I watch dew point and overnight temperature: when they converge and the wind drops below a whisper, the valley fills. The third night, the numbers finally lined up, and I barely slept.',
        ],
      },
      {
        type: 'figure',
        src: photos.valley,
        ratio: '3 / 2',
        caption: 'Blue hour on the approach — 04:52, before the fog lifted.',
      },
      {
        type: 'quote',
        text: 'The best frames arrive when you stop chasing them — you just have to be there, ready, when they do.',
      },
      {
        type: 'text',
        paragraphs: [
          'When it came, it lasted maybe eight minutes. The fog sat exactly where I’d imagined, the sun broke the ridge, and for a moment the whole valley glowed the colour of cold steel. I made eleven frames. One of them was the picture I’d carried for two years.',
          'The lesson isn’t about gear or settings — a 14mm at f/8 did the whole job. It’s that the photograph was made on the two mornings I came home empty-handed, not the one that worked. Showing up is the technique.',
        ],
      },
      {
        type: 'figure',
        src: photos.stars,
        ratio: '16 / 9',
        caption: 'The frame I came for — 05:38, eight minutes of light.',
      },
    ],
  },
  {
    slug: 'milky-way-halgurd',
    cat: 'Tips',
    date: 'Jan 2026',
    read: '6 min read',
    src: photos.stars,
    title: 'Shooting the Milky Way over Halgurd',
    excerpt: 'Planning, focus, and stacking for a clean astro panorama in sub-zero cold.',
  },
  {
    slug: 'sigma-bf',
    cat: 'Gear',
    date: 'Jan 2026',
    read: '5 min read',
    src: '',
    title: 'Why I switched to the Sigma BF',
    excerpt: 'A stripped-back body changed how I shoot landscapes. What I gained, what I gave up.',
  },
  {
    slug: 'two-gigapixel-panorama',
    cat: 'Tutorial',
    date: 'Dec 2025',
    read: '12 min read',
    src: photos.valley,
    title: 'Stitching a two-gigapixel panorama',
    excerpt: 'From capture grid to final export — my full workflow for massive stitched frames.',
  },
  {
    slug: 'portraits-marshlands',
    cat: 'Behind the scenes',
    date: 'Dec 2025',
    read: '7 min read',
    src: photos.herder,
    title: 'Portraits of the marshlands',
    excerpt: 'Three days with the buffalo herders of the south, and the trust a portrait needs.',
  },
  {
    slug: 'light-in-old-mosques',
    cat: 'Craft',
    date: 'Nov 2025',
    read: '6 min read',
    src: photos.arch,
    title: 'Reading light in old mosques',
    excerpt: 'How I meter and wait for the one shaft of light that makes an interior sing.',
  },
  {
    slug: 'week-teaching-erbil',
    cat: 'Journal',
    date: 'Nov 2025',
    read: '4 min read',
    src: photos.assignment,
    title: 'A week teaching in Erbil',
    excerpt: 'Notes on running a field workshop, and what students taught me back.',
  },
]

export const featuredPost = posts.find((p) => p.featured)
export const listedPosts = posts.filter((p) => !p.featured)

export const getPost = (slug) => posts.find((p) => p.slug === slug) ?? featuredPost

export const relatedTo = (post, count = 3) =>
  posts.filter((p) => p.slug !== post.slug).slice(0, count)
