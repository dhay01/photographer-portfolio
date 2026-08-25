# ghaith salih® — photographer portfolio

Vue 3 + Vite. The public website: seven pages, all of them driven by content from
the Laravel API in the **`ghaith-salih-api`** repository.

Nothing here is hardcoded content. Photos, page headings, blog posts, workshop
details, contact information and the About page are all fetched at runtime and
edited in the dashboard, not in this codebase.

---

## What still needs doing

- [ ] **Set `VITE_API_URL`** to the API's real address before building. It is
      compiled into the bundle, so a wrong value ships a site that talks to
      nothing.
- [ ] **Build with Node 22.12 or newer.** Vite 8 will not run on Node 21.
- [ ] **Upload the real photography** through the dashboard. Anywhere a photo has
      no image file, the site renders a labelled placeholder rather than a broken
      image.

**Deliberate gap:** the language switcher in the navbar is visible but
**disabled**. The interface strings exist in Arabic (`src/i18n/ar.json`), but
every translatable field in the database is still English-only, so switching
would show a half-translated site. Once the Arabic tabs are filled in the
dashboard, set `languageEnabled = true` in `src/components/SiteNav.vue` — the
handler is already wired, and `setLocale()` handles the RTL flip.

---

## Running it

Needs **Node 22.12+**. If the machine default is older:

```sh
nvm use 22
npm install
cp .env.example .env.local     # point VITE_API_URL at the API
npm run dev
```

The API must be running, or every page loads empty — it supplies all content, not
just the reservation form.

```sh
# in ../ghaith-salih-api
php artisan serve --port=8123
php artisan queue:work
```

⚠️ Use `http://localhost:5173`, not `127.0.0.1:5173`. The API's CORS list names
specific origins, and the browser treats the two spellings as different.

---

## Deploying

```sh
VITE_API_URL=https://api.example.com npm run build
```

Upload the resulting `dist/` folder to any static host — Netlify, Cloudflare
Pages, or a folder on the same server as the API. There is no Node on the server;
the output is plain HTML, CSS and JavaScript.

**`VITE_API_URL` is baked in at build time, not read at runtime.** Changing the
API's address later means rebuilding and re-uploading, not editing a setting.

The API's `FRONTEND_ORIGINS` must list wherever this ends up, or the browser
blocks every request and the site renders empty.

---

## Structure

```
src/
  style.css                 design tokens + shared utility classes
  router/                   7 routes, lazy-loaded except the homepage
  main.js                   app, router and i18n wiring

  lib/
    api.js                  API client (ApiError carries Laravel's 422 bag)
    format.js               dates, prices, workshop date ranges

  i18n/
    index.js                locale list, setLocale (sets lang + dir)
    en.json / ar.json       interface labels only — never content

  composables/
    useContent.js           fetch + loading/error state for any endpoint
    useSite.js              site settings, fetched once and shared
    useReservationQuestions.js  intake questions, fetched from the API
    useSiteMotion.js        all GSAP choreography

  components/
    SiteNav / SiteFooter    shared chrome, incl. the language switcher
    HeroCarousel            crossfade + Ken Burns + scrub parallax
    ImageSlot               <img> with a labelled fallback panel
    WorkLightbox            lightbox + OpenSeadragon deep zoom
    ReserveModal            workshop intake form, posts to the API
    PostCard / MiniFooter

  pages/                    one per route
```

There is no `src/data/`. It held the site's content until everything moved to the
API; anything still referencing it is out of date.

### Two rules about text

- **Content** — anything the photographer would want to change — comes from the
  API. Never put it in a component.
- **Interface labels** — "Read more", "Filter", section eyebrows — live in
  `src/i18n/en.json`. Never put them in a component either.

If you are adding a string and unsure which it is: would the photographer expect
to edit it without a developer? Then it belongs in the API.

---

## Things worth knowing

**Motion** opts in per element via data attributes (`data-reveal`, `data-fade`,
`data-tile`, `data-cross`, `data-bracket`) and is skipped entirely under
`prefers-reduced-motion`.

**Missing images degrade quietly.** `ImageSlot` renders a labelled panel when a
photo has no file or the file fails to load, so the layout never breaks.

**Deep zoom** loads OpenSeadragon on demand — it is a 348 KB chunk that only
downloads when a visitor actually opens a gigapixel photo. The viewer is handed
tile geometry as JSON rather than fetching a `.dzi` descriptor, which avoids
cross-origin problems entirely.

**The reservation form is generated.** Its questions come from
`/api/reservation-questions`, which is the same definition the server validates
against, so the form and its rules cannot drift apart. Validation errors come
back mapped onto the matching question and render inline.
