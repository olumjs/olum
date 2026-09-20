---
title: Build & Deploy
group: Getting Started
order: 26
---

One command produces a production-ready site:

```bash
npm run build
```

It compiles every component, bundles the app with **vite** (installed automatically into your project on the first build), and writes the result to `dist/` at your project root:

```text title="dist/"
dist/
├── index.html                  ← entry, rewritten to load the hashed bundle
└── assets/
    ├── index-<hash>.js         ← your app, minified
    ├── index-<hash>.css        ← main.css + all component styles
    ├── favicon-<hash>.svg
    └── ...                     ← every file from public/assets, plus code-split chunks
```

- **Static assets** — everything in `public/` is included: files the bundler can trace get hashed names; files referenced from runtime strings (like `url(/assets/{type}.svg)`) are copied as-is. See [Static Assets](/docs/static-assets).
- **Compile errors fail the build** — the errors are printed and no bundle is produced (the command exits non-zero, so CI catches it). Fix the component and re-run.

## Prerendering (optional, recommended)

Add a `src/sitemap.js` and the same command also **prerenders every route** — it runs your app in a real browser once per URL and saves the finished DOM as that route's own `index.html`:

```text title="dist/ with prerendering"
dist/
├── index.html                  ← "/"
├── sitemap.xml
├── about/index.html            ← "/about"
├── blog/hello/index.html       ← "/blog/hello"
└── assets/…
```

That gives you crawler-readable HTML, a faster first paint, and **deep links that work with no host configuration at all** — see [Prerendering & SEO](/docs/prerendering) for the whole story, and [Page Metadata & SEO](/docs/metadata) for the `<head>` each page writes into its file.

Build settings live under one `olum` key:

```json title="package.json"
{
  "olum": {
    "SITE_URL": "https://example.com",
    "SSG_DELAY": 500,
    "base": "/"
  }
}
```

`SITE_URL` is the absolute base for every `<loc>` in `sitemap.xml` — without it crawlers ignore the file. `SSG_DELAY` is settling time in milliseconds per route, `500` by default — set it to `0` when no page fetches its data in `onMount`. Both are optional and documented in [Prerendering & SEO](/docs/prerendering). `base` is the URL prefix every asset link in `dist/` gets — `/` by default, and the setting you need when the site is **not** served from the root of a domain ([Base URL](#base-url)).

## Previewing the build

```bash
npm start
```

serves `dist/` the way a static host would, so you can check the production output — including prerendered pages — before you deploy.

## Deploying

`dist/` is plain static files — host it anywhere (Netlify, Vercel, Cloudflare Pages, GitHub Pages, nginx, S3…).

**If you prerendered**, there is nothing to configure. `/blog/hello` is a real directory with a real `index.html`, and every static host resolves that on its own.

**If you did not**, one rule matters:

:::warn
The router uses **history mode**, so the server must serve `index.html` for every non-file path — otherwise refreshing a deep route like `/blog/hello` 404s before the app can match it. Most static hosts call this an "SPA fallback" or "rewrite all to /index.html".
:::

```text title="Netlify — public/_redirects"
/*  /index.html  200
```

```json title="Vercel — vercel.json"
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

(The router only falls back to **hash mode** URLs (`/#/blog/hello`) when the browser lacks the History API — it can't detect a missing server rewrite, so this configuration is on you.)

:::tip
Keeping the fallback is harmless even with prerendering, and it is what you want when only *some* routes are prerendered: those hit their own file, the rest fall back to the shell and render client-side.
:::

## Base URL

Every link the build writes into `dist/` — the `<script>` and `<link>` tags in `index.html`, the hashed asset names — starts at the **site root** by default: `/assets/index-abc123.js`. That is right for a site served from the root of a domain, and wrong everywhere else. One setting changes it:

```json title="package.json"
{
  "olum": { "base": "./" }
}
```

| `base` | Links in `dist/` become | Use it for |
|--------|-------------------------|------------|
| missing or `"/"` | `/assets/index-abc123.js` | a site at the root of a domain — **the default** |
| `"./"` | `./assets/index-abc123.js` | a desktop shell (nw.js, Electron) that opens `dist/index.html` over `file://`, where a leading `/` means the filesystem root |
| `"/app/"` | `/app/assets/index-abc123.js` | hosting under a sub-path, e.g. a GitHub Pages project site |
| `"https://cdn.example.com/"` | `https://cdn.example.com/assets/index-abc123.js` | assets on a CDN while `index.html` stays on your own host |

Slashes are normalized for you (`"app"`, `"/app"` and `"/app/"` mean the same thing), any value starting with `.` becomes `"./"`, and a value containing spaces, quotes or angle brackets is refused with an error line and the build falls back to `/`. `BASE` is accepted as a spelling of the same key. When the base isn't `/` the build says so before it runs:

```text
building with base "./"
```

Only the **build** reads it — `npm run dev` always serves from `/`.

### What gets rewritten

Vite re-points every URL it can see: the tags in `public/index.html` and every asset reached through an import. Component templates are compiled into plain strings it cannot see, so the build makes a second pass over them and re-points `src`, `href` and `poster` values that name a file really present in `public/`:

```html
<img src="/assets/logo.svg" />   <!-- under base "./" the built bundle says ./assets/logo.svg -->
```

Two things are left alone on purpose, and both matter under a non-default base:

- **`url(...)` inside a component `<style>`**, and **paths assembled at runtime** (`url(/assets/{type}.svg)`) — the build never sees those as a whole URL, so they stay root-absolute. Reference such images from a template `src` attribute instead, or keep the app somewhere a root-absolute path still resolves.
- **Router links (`to="/about"`)** — those are routes, not files. A sub-path deploy handles them with the router's own `root` (below).

:::warn
`"./"` and [prerendering](/docs/prerendering) do not mix. A prerendered route is a copy of `dist/index.html` sitting in its own directory, so `./assets/…` resolves against `/blog/hello/` and 404s. Use `/` or a sub-path for a prerendered site — a `file://` shell has no crawler to please anyway.
:::

### A sub-path needs the router too

`base` moves the **assets**; it says nothing about **routes**. Under `/app/` the browser's path is `/app/about` while your route is `/about`, and the generated router (which assumes `/`) answers with the 404 page. Write the entry file yourself and give the router the same prefix:

```js title="src/main.js"
import Olum from "olum";
import Router from "olum-router";

import Home from "./page.js";
import About from "./about/page.js";

const routes = [
  { path: "/", comp: Home },
  { path: "/about", comp: About }
];

const router = new Router({ mode: "history", root: "/app", routes: routes });
new Olum().$("#olum-app").use(router);
```

Creating `src/main.js` switches off route generation, so the route table becomes yours to maintain — see [The Router](/docs/router) for the full manual setup.
