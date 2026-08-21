# ghaith salih® — photographer portfolio

Vue 3 + Vite implementation of the Claude Design project
`189d0c32-1893-4a96-9dd8-959f525722cc` (7 HTML prototypes).

## Running it

Vite 8 needs Node **20.19+ or 22.12+**. The machine default is Node 21, which
Vite rejects:

```sh
nvm use 22
npm install
cp .env.example .env.local   # point VITE_API_URL at the Laravel API
npm run dev
```

The backend lives in a separate repo (`../ghaith-salih-api`) and must be running
for the workshop reservation form to submit.

## Structure

```
src/
  style.css                 design tokens + shared utility classes
  router/                   7 routes, lazy-loaded except the homepage
  lib/api.js                API client (ApiError carries Laravel's 422 bag)
  composables/
    useSiteMotion.js        all GSAP choreography (reveals, fades, tile zoom, hero parallax)
  components/
    SiteNav / SiteFooter    shared chrome
    HeroCarousel            5-slide crossfade + Ken Burns + scrub parallax
    ImageSlot               <img> with a labelled fallback panel
    WorkLightbox            lightbox + gigapixel deep-zoom preview
    ReserveModal            workshop intake form, posts to the API
    PostCard / MiniFooter
  data/                     all copy and content, no strings in templates
  pages/                    one per prototype
```

Motion opts in per element via data attributes (`data-reveal`, `data-fade`,
`data-tile`, `data-cross`, `data-bracket`) and is skipped entirely under
`prefers-reduced-motion`.

## Missing photography

Five source images exceed the design API's 256 KiB per-file transfer cap and
could only be fetched truncated, so they were left out rather than shipped
half-decoded. Drop these into `public/uploads/` with **exactly these names** and
they will appear everywhere automatically — the paths are already wired up in
`src/data/photos.js`:

```
589903741_18554882992055421_5603779562178377351_n.jpg
608189925_18557068639055421_3317370782112853283_n.jpg
651054829_18577811026055421_4883273883445382392_n.jpg
651508649_18577811014055421_4024825212185473190_n.jpg
Screenshot 2026-08-02 at 11.07.18 AM.png
```

Until then `ImageSlot` degrades to a labelled placeholder panel — no broken
images.

## Workshop reservation form

`src/data/reservationQuestions.js` holds the 11 intake questions ported from the
Arabic Google Form. Each question keeps its original Arabic wording in an `ar`
field, so the form can be switched to Arabic or shown bilingually without
re-sourcing it. The labels currently render in English to match the rest of the
site.

The backend mirrors these in `config/reservation_questions.php` and validates
against them — **change both together.** Server-side validation errors are
mapped back onto the matching question and shown inline.
