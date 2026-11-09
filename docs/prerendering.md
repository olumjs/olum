---
title: Prerendering & SEO
group: Build & SEO
order: 240
---

Olum apps run in the browser. That's great for users, but a search engine or a link preview that reads `dist/blog/hello/index.html` would only find an empty shell.

**Prerendering** fixes that. During the build, Olum opens each page of your app in a real browser and saves the finished HTML as that page's own file:

```text
npm run build
      ↓
compile + bundle
      ↓
collect every route
      ↓
open YOUR app in a real browser, once per route
      ↓
save the rendered HTML as that route's index.html
      ↓
deploy dist/ to any static host
```

You get a fast first paint, working deep links, and pages crawlers can read. Once the page loads in a browser, it's a normal Olum app again.

## Turn it on

Create **`src/sitemap.js`**. That file is the on/off switch: without it, the build doesn't prerender.

```js title="src/sitemap.js"
import { getPosts } from "./api.js";

export default async function () {
  const posts = await getPosts();
  return posts.map((post) => `/blog/${post.slug}`);
}
```

- It exports a **function** that returns an **array of URLs**. It can be `async`.
- It's normal code: imports, `fetch`, a database client, anything Node can run.
- You only list the **real URLs for dynamic routes** (like `/blog/hello` for `blog/[slug]`). Normal routes are found from your `page.html` files automatically.

:::tip
`src/sitemap.js` is not a route and is never sent to the browser. It only runs during the build.
:::

## Which pages get prerendered

Your normal routes **plus** whatever `sitemap.js` returns, without duplicates:

```text
from your folders           from sitemap.js
  /                           /blog/hello
  /about                      /blog/world
  /blog                       /match/liverpool
  /blog/:slug        ✗ dropped (a pattern, not a URL)
  /match/:slug       ✗ dropped
        └────────────┬────────────┘
                     ▼
  /  /about  /blog  /blog/hello  /blog/world  /match/liverpool
```

A URL from `sitemap.js` that no route can show is skipped.

## The output

Each route becomes a **folder with its own `index.html`**:

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
    └── …
```

A parent folder only gets a file if it's a route itself. If nothing defines `/match`, there's no `dist/match/index.html`.

Each file contains the full page, including [your page's `<head>`](/docs/metadata):

```html title="dist/blog/hello/index.html"
<!doctype html>
<html lang="en" data-olum>
  <head>
    <title>Hello — My Blog</title>
    <meta name="description" content="…" />
    …
  </head>
  <body>
    <div id="olum-app"><div data-olum="…"><article><h1>Hello</h1>…</article></div></div>
    <script type="module" src="/assets/index-<hash>.js"></script>
  </body>
</html>
```

The build prints what it wrote and how big each page is:

```text
SSG: 6 route(s) to prerender
 ✓ 1/6  /about
 ✓ 2/6  /blog
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

## No server rewrite needed

Without prerendering, your host must answer `/blog/hello` with `/index.html` (see [Build & Deploy](/docs/build-and-deploy#deploying)). With prerendering, `/blog/hello` **is a real file**, so it works on any static host with **zero setup**.

:::tip
Keep the fallback anyway if some routes are **not** prerendered (for example a `/blog/:slug` you left out of `sitemap.js`). Prerendered routes load their own file; the rest fall back to the shell.
:::

## Pages that load data

A page that fetches data in `onMount` is **empty at first**:

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

The build saves a page as soon as something appears on screen, which is **before** the `await` finishes. Without a wait, you'd ship the loading state. `SSG_DELAY` (default `500` ms) gives each page time to finish:

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

The `<head>` updates with the page, so the file gets both the content and the metadata.

### Picking a value

Start with 200–500 ms. The build tells you what it costs:

```text
SSG: waiting 500ms after each route (+46.5s to this build)
```

Then **check a file**, because a delay that's too short fails silently:

```bash
grep -o "<title[^>]*>[^<]*</title>" dist/match/liverpool/index.html
```

Still showing the loading state? Raise it. Build too slow? Lower it and check again.

:::warn
- **Too short:** the build writes a half-finished page and still prints ✓. Nobody notices until search traffic drops.
- **Too long:** you pay it on every route (500 ms × 93 routes = 46 s per build).
- It's a fixed wait, not a check. A slow API or a busy CI machine can miss a value that works on your laptop. Keep the data prerendered pages need fast and local if you can.
:::

## sitemap.xml

Every route that was saved is listed in `dist/sitemap.xml` with today's date as `<lastmod>`. A route that failed to render is left out (a broken link would hurt your search ranking).

Search engines need full URLs in a sitemap, so tell the build your domain with `SITE_URL`. Without it, the build warns and writes relative paths.

## Build settings

All under the `olum` key in `package.json`. None is required; the build tells you what you're missing.

```json title="package.json"
{
  "olum": {
    "SITE_URL": "https://example.com",
    "SSG_DELAY": 500,
    "base": "/"
  }
}
```

### `SITE_URL`

Your domain, put in front of every URL in `sitemap.xml`. Search engines ignore relative URLs there, and the build can't guess your domain.

| Set to | Result |
|--------|--------|
| `"https://example.com"` | `<loc>https://example.com/blog/hello</loc>` |
| missing | a warning, and relative `<loc>` values that crawlers ignore |

A trailing slash is removed for you.

### `SSG_DELAY`

Extra wait, in **milliseconds per route**, after the page appears and before it's saved. Useful for pages that [load data](#pages-that-load-data).

| Set to | Result |
|--------|--------|
| missing | 500 ms (**default**) |
| `0` | no wait |
| `250` | each route waits 250 ms |
| not a number (`true`, `"soon"`, `-1`) | an error message, then 500 is used (the build doesn't fail) |

Set `0` when every page already has its data: the wait is just wasted build time, on every route.

### `base`

Where the site lives, `/` by default. See [Base URL](/docs/build-and-deploy#base-url).

:::warn
Prerendering only works with `"/"` or a sub-folder like `"/app/"`. A relative base (`"./"`) breaks it: each page is in its own folder, so `./assets/…` is looked up in `/blog/hello/assets/…` and fails.
:::

## In the browser

The prerendered HTML is what crawlers, link previews and the first paint see. When the app starts, it renders into `#olum-app` as usual and takes over.

:::note
The prerendered HTML is **replaced**, not reused ("hydrated"). Anything that must survive into the running app belongs in `state`, not in the saved HTML.
:::

## Preview

```bash
npm start
```

With `src/sitemap.js`, `/blog/hello` serves `dist/blog/hello/index.html`, so you see the prerendered page. Without it, every route serves the root `index.html`, like a real host would.

## The first build is slower

Prerendering needs a browser:

- **vite** is installed on the first build (any build).
- **puppeteer** is installed on the first build that prerenders, and downloads Chrome (~150 MB) once.

No `sitemap.js`, no puppeteer download.

## Good to know

- **A page that fails is reported, not fatal.** The build prints `✗ /blog/hello — failed to render …` and continues. That route keeps the plain shell and is left out of `sitemap.xml`.
- **A page counts as ready** when the router has put something in `#olum-app` (max 15 s). That's before an `onMount` fetch finishes, hence `SSG_DELAY`.
- **Only work done at load time is captured.** Data loaded on a click, a timer longer than the delay, or a scroll observer won't be in the file, which is usually what you want.
- **`/` is saved last** on purpose: the local preview server uses `dist/index.html` for unknown URLs, so it has to stay a blank shell until the other routes are done.
- **Compile errors fail the whole build**, so CI catches them before deploying.

## See also

- [Page Metadata & SEO](/docs/metadata): the `<head>` each page writes into its file.
- [Build & Deploy](/docs/build-and-deploy): the build output and host setup.
- [File Conventions](/docs/router/file-conventions): how folders become routes.
