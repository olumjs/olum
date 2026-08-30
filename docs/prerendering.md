---
title: Prerendering & SEO
group: Getting Started
order: 27
---

Olum components are client components. There is no server runtime, no `"use server"`, no split between what runs where — you write `state`, events and DOM APIs the normal way.

Prerendering closes the one gap that costs you: **a crawler that reads `dist/blog/hello/index.html` gets the finished page, not an empty shell.** The same client code you already wrote produces it.

```text
npm run build
      ↓
compile + bundle
      ↓
collect every route
      ↓
run YOUR app in a real browser, once per route
      ↓
save the rendered DOM as that route's index.html
      ↓
deploy dist/ to any static host
```

The result behaves like a server-rendered site for the things that matter — first paint, direct deep links, crawlers, link unfurlers — and stays a normal Olum SPA the moment the runtime boots.

## Turning it on

Add **`src/sitemap.js`**. That file is the switch: no `sitemap.js`, no prerendering, and `npm run build` behaves exactly as it did before.

```js title="src/sitemap.js"
import { getPosts } from "./api.js";

export default async function () {
  const posts = await getPosts();
  return posts.map((post) => `/blog/${post.slug}`);
}
```

- It default-exports a **function** that returns an **array of route strings**. It may be `async`.
- It is normal app code — imports, `fetch`, a database client, anything Node can run. The build bundles it with vite before calling it.
- You only list what the file tree can't know: the **concrete URLs behind dynamic segments**. Static routes come from your `page.html` files automatically.

:::tip
`src/sitemap.js` is not a route and never ships to the browser. It runs only during the build.
:::

## What gets prerendered

The final list is **your static routes + whatever `sitemap.js` returns**, deduplicated:

```text
from the file tree          from sitemap.js
  /                           /blog/hello
  /about                      /blog/world
  /blog                       /match/liverpool
  /blog/:slug        ✗ dropped — a pattern, not a URL
  /match/:slug       ✗ dropped
        └────────────┬────────────┘
                     ▼
  /  /about  /blog  /blog/hello  /blog/world  /match/liverpool
```

A route still containing a `:param` is a pattern, not a page, so it is dropped. `/blog/hello` is kept because `/blog/:slug` exists to match it — a sitemap path no route can serve is skipped rather than written as a dead file.

## The output

Each route becomes a **directory with its own `index.html`**:

```text title="dist/"
dist/
├── index.html                  ← "/"
├── sitemap.xml
├── about/
│   └── index.html              ← "/about"
├── blog/
│   ├── index.html              ← "/blog"
│   ├── hello/index.html        ← "/blog/hello"
│   └── world/index.html
├── match/
│   └── liverpool/index.html
└── assets/
    ├── index-<hash>.js
    ├── index-<hash>.css
    └── …
```

Intermediate segments only get a file when they are routes themselves. If nothing declares `/match`, no `dist/match/index.html` is written — the router would answer that URL with a 404 anyway, so it would be dead weight.

Each file holds the **fully rendered DOM**, including the [head your page declared](/docs/metadata):

```html title="dist/blog/hello/index.html"
<!doctype html>
<html lang="en" data-olum>
  <head>
    <title>Hello — My Blog</title>
    <meta name="description" content="…" />
    <meta property="og:image" content="…" />
    …
  </head>
  <body>
    <div id="olum-app"><div data-olum="…"><article><h1>Hello</h1>…</article></div></div>
    <script type="module" src="/assets/index-<hash>.js"></script>
  </body>
</html>
```

The build prints what it wrote, with the weight a visitor downloads:

```text
SSG: 6 route(s) to prerender
 ✓ 1/6  /about
 ✓ 2/6  /blog
 ✓ 3/6  /blog/hello
 …
SSG: prerendered 6 page(s)
SSG: sitemap.xml lists 6 URL(s)

/
├── about                   1.4 kB
├── blog                    1.1 kB
│   ├── hello               2.3 kB
│   └── world               2.1 kB
└── match
    └── liverpool           1.8 kB
```

## No catch-all rewrite needed

Without prerendering, history-mode URLs need an SPA fallback: the host must answer `/blog/hello` with `/index.html`, or a refresh 404s before the app can match the route.

With prerendering, `/blog/hello` **is a real file**. Every static host resolves a directory to its `index.html` on its own, so the deep link works with **zero host configuration** — the same experience a server catch-all gives you, without the server.

```text
GET /blog/hello
  →  dist/blog/hello/index.html      ← plain static file lookup
```

That is the whole point: deploy to Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3 + CDN or nginx, with nothing but the folder.

:::tip
Keep the SPA fallback anyway if some routes are **not** prerendered (a `/blog/:slug` you chose to leave out of `sitemap.js`). Prerendered routes hit their own file; everything else falls back to the shell and renders client-side. Both work.
:::

## Pages that fetch their data

A page that loads its data in `onMount` renders **empty first** and fills in a moment later:

```html title="src/match/[slug]/page.html"
<head>
  <title>{slug} vs {state.post?.opponent}</title>
</head>

<script>
  import { params, onMount } from "olum";
  import { getMatch } from "../../api.js";

  const { slug } = params();
  const state = { post: null };

  onMount(async () => {
    state.post = await getMatch(slug);
  });
</script>

<h1>{slug} vs {state.post?.opponent}</h1>
```

A route is captured once the bundle has settled and the router has put something into `#olum-app` — which happens **before** that `await` resolves. Snapshot it there and you ship the loading state: an empty `<h1>` and a half-built `<title>`.

Give every route some settling time and the snapshot waits for the data:

```json title="package.json"
{
  "olum": { "SSG_DELAY": 500 }
}
```

```html title="dist/match/liverpool/index.html"
<title>liverpool vs barcelona</title>
…
<h1>liverpool vs barcelona</h1>
```

The [`<head>`](/docs/metadata) re-renders with the page, so the metadata catches up with the data along with the markup — the file gets both, or neither.

### Choosing a value

It is **off by default** (`0`). Start small — 200–500 ms covers most local and same-region data — and the build tells you what it costs before it spends it:

```text
SSG: waiting 500ms after each route (+46.5s to this build)
```

Then **check the file**, because this is the one setting that fails quietly:

```bash
grep -o "<title[^>]*>[^<]*</title>" dist/match/liverpool/index.html
```

If the title still shows the loading state, raise it. If the build got slow, lower it and check again.

:::warn
A delay is a blunt instrument, so treat the number as something you verified rather than something you guessed. Too short and the build writes a half-finished page **while still printing a tick** — a silent SEO regression nobody notices until traffic drops. Too long and you pay it on every route: 500 ms across 93 routes is 46 s added to every build.

It is also a *fixed* wait, not a measurement, so a slow API or a CI runner on a bad day can miss a value that always worked on your laptop. Keep the data a prerendered page needs fast and local where you can.
:::

## sitemap.xml

Every route that ended up as a real file is listed in `dist/sitemap.xml`, with today's date as `<lastmod>`. A route that failed to render is left out — a `<loc>` the host answers with a 404 burns crawl budget and is reported as an error in Search Console.

Crawlers ignore relative `<loc>` values, and nothing in the build knows your domain, so tell it:

```json title="package.json"
{
  "olum": { "SITE_URL": "https://example.com" }
}
```

If it isn't set the build warns and falls back to relative paths.

## Build settings (`package.json`)

Both settings live under one `olum` key. Neither is required — the build runs without them and tells you what it lost.

```json title="package.json"
{
  "olum": {
    "SITE_URL": "https://example.com",
    "SSG_DELAY": 500
  }
}
```

### `SITE_URL`

The absolute base for every `<loc>` in `dist/sitemap.xml`.

**Why it exists:** a sitemap is a file a crawler fetches from *somewhere else*, so relative paths are meaningless in it — crawlers drop them. Nothing in the build knows the domain you deploy to, so you have to say.

| Set to | Result |
|--------|--------|
| `"https://example.com"` | `<loc>https://example.com/blog/hello</loc>` |
| missing | build warns, `<loc>` values come out relative and crawlers ignore them |

A trailing slash is trimmed for you, so `"https://example.com/"` and `"https://example.com"` behave the same.

### `SSG_DELAY`

Extra settling time, in **milliseconds, per route**, taken after the page reports itself rendered and before its DOM is captured.

**Why it exists:** the build snapshots a route as soon as the router has put something on screen. A page that fetches in `onMount` is not finished at that moment — see [Pages that fetch their data](#pages-that-fetch-their-data). The delay buys that work time to land.

| Set to | Result |
|--------|--------|
| missing | 500 ms — **the default** |
| `0` | no wait — opt out |
| `250` | every route waits 250 ms before capture |
| anything not a number (`true`, `"soon"`, `-1`) | error line, treated as 500 — never fails the build |

The default covers the common case: a page that loads data at mount. Set it to `0` when every page renders from data it already has — the wait is pure build time you'd never get back, and it is charged per route.

## What happens in the browser

The prerendered HTML is what a crawler, a link unfurler and the first paint see. When the runtime boots it mounts normally into `#olum-app` and takes over — you get an ordinary interactive SPA from there, with client-side navigation between routes.

:::note
The prerendered markup is **replaced**, not hydrated. It exists for SEO, first paint and direct route access. Anything that must survive into the live app belongs in `state`, not in the prerendered DOM.
:::

## Previewing the build

```bash
npm start
```

serves `dist/` the way a static host would: with `src/sitemap.js` present it resolves `/blog/hello` to `dist/blog/hello/index.html`, so you see the prerendered page and not the shell. Without it, every route falls back to the root `index.html` — the same rule the production host follows.

## First build is slower

Prerendering runs your app in a real browser, so it needs one:

- **vite** installs into your project on the first build (any build).
- **puppeteer** installs on the first build that prerenders, and downloads Chrome (~150 MB), once.

A project that never adds `sitemap.js` never pays for either of these.

## Things to know

- **A route that fails to render is reported, not fatal.** The build prints `✗ /blog/hello — failed to render …` and moves on; that route keeps its plain shell and is left out of `sitemap.xml`.
- **A page is "ready" when the router has mounted something into `#olum-app`**, with a 15 s ceiling on getting there. That moment is before an `onMount` fetch resolves — see [Pages that fetch their data](#pages-that-fetch-their-data).
- **Only mount-time work is worth waiting for.** Data loaded on a click, a timer past the delay, or an intersection observer is not in the snapshot — which is normally what you want.
- **`/` is rendered last** on purpose: the local preview server answers unknown URLs with `dist/index.html`, so that file has to stay a blank shell while the other routes boot from it.
- **Compile errors fail the whole build** (non-zero exit), so CI catches them before anything is deployed.

## See also

- [Page Metadata & SEO](/docs/metadata) — the `<head>` block a prerendered page writes into its file.
- [Build & Deploy](/docs/build-and-deploy) — the build output and host configuration.
- [File Conventions](/docs/file-conventions) — how the file tree becomes the route list.
