---
title: Build & Deploy
group: Build & SEO
order: 220
---

Build your site for production with one command, then upload the `dist/` folder to any static host:

```bash
npm run build
```

It compiles your components, bundles everything with **vite** (installed for you on the first build), and writes the result to `dist/`:

```text title="dist/"
dist/
├── index.html                  ← entry page
└── assets/
    ├── index-<hash>.js         ← your app, minified
    ├── index-<hash>.css        ← main.css + all component styles
    ├── favicon-<hash>.svg
    └── ...                     ← every file from public/assets, plus code-split chunks
```

- **Everything in `public/` is included.** Files the bundler can see get hashed names; files used in runtime strings (like `url(/assets/{type}.svg)`) are copied as-is. See [Static Assets](/docs/static-assets).
- **A compile error stops the build.** The errors are printed, nothing is written, and the command fails (so CI catches it).

## Preview the build

```bash
npm start
```

This serves `dist/` like a real host would, so you can check it before deploying.

## Prerendering (recommended)

Add a `src/sitemap.js` file and the build also saves every route as its own HTML file (`dist/about/index.html`, `dist/blog/hello/index.html`, …) plus a `sitemap.xml`. You get pages search engines can read, a faster first paint, and deep links that work with no server setup. See [Prerendering & SEO](/docs/prerendering).

## Build settings

All build settings go under an `olum` key in `package.json`. All are optional:

```json title="package.json"
{
  "olum": {
    "SITE_URL": "https://example.com",
    "SSG_DELAY": 500,
    "base": "/"
  }
}
```

| Setting | What it does |
|---------|--------------|
| `SITE_URL` | Your domain, used in `sitemap.xml`. Without it, search engines ignore the sitemap. |
| `SSG_DELAY` | How long (ms) to wait on each route before saving it when prerendering. Default `500`. Use `0` if no page loads data in `onMount`. |
| `base` | Where the site lives. Default `/`. See [Base URL](#base-url). |

The first two are explained in [Prerendering & SEO](/docs/prerendering#build-settings).

## Deploying

`dist/` is plain static files. Upload it anywhere: Netlify, Vercel, Cloudflare Pages, GitHub Pages, nginx, S3…

**If you prerendered**, there is nothing to configure. `/blog/hello` is a real folder with an `index.html`, and every host serves that.

**If you didn't prerender**, you need one setting:

:::warn
The router uses clean URLs (**history mode**), so your host must send `index.html` for every path that isn't a real file. Otherwise, refreshing a page like `/blog/hello` shows a 404. Hosts usually call this an "SPA fallback" or "rewrite all to /index.html".
:::

```text title="Netlify — public/_redirects"
/*  /index.html  200
```

```json title="Vercel — vercel.json"
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

The router can't detect a missing rewrite. It only switches to hash URLs (`/#/blog/hello`) when the browser has no History API.

:::tip
Keeping the fallback is harmless with prerendering, and useful when only *some* routes are prerendered: those load their own file, the rest fall back to the shell.
:::

## Base URL

By default, every link in `dist/` starts at the site root: `/assets/index-abc123.js`. That's right when your site is at the root of a domain. If not, set `base`:

```json title="package.json"
{
  "olum": { "base": "./" }
}
```

| `base` | Links become | Use it for |
|--------|--------------|------------|
| missing or `"/"` | `/assets/index-abc123.js` | a site at the root of a domain (**default**) |
| `"./"` | `./assets/index-abc123.js` | a desktop app (nw.js, Electron) that opens `dist/index.html` from disk (`file://`) |
| `"/app/"` | `/app/assets/index-abc123.js` | a site in a sub-folder, e.g. a GitHub Pages project site |
| `"https://cdn.example.com/"` | `https://cdn.example.com/assets/index-abc123.js` | assets on a CDN, `index.html` on your host |

- Slashes are fixed for you: `"app"`, `"/app"` and `"/app/"` are the same. Anything starting with `.` becomes `"./"`.
- A value with spaces, quotes or `<` `>` is rejected with an error and the build uses `/`.
- `BASE` (uppercase) also works.
- When the base isn't `/`, the build prints `building with base "./"` first.
- Only the **build** uses it. `npm run dev` always serves from `/`.

### What gets rewritten

Vite fixes the URLs it can see (tags in `public/index.html`, imported assets). The build also fixes `src`, `href` and `poster` in your templates when they point to a real file in `public/`:

```html
<img src="/assets/logo.svg" />   <!-- with base "./" the bundle says ./assets/logo.svg -->
```

Two things are **not** rewritten:

- **`url(...)` in a component `<style>`**, and **paths built at runtime** (`url(/assets/{type}.svg)`). These stay `/...`, so use a template `src` attribute for those images instead.
- **Router links (`to="/about"`)**: those are routes, not files. Use the router's `root` (below).

:::warn
Don't use `"./"` with [prerendering](/docs/prerendering). Each prerendered page sits in its own folder, so `./assets/…` is looked up in `/blog/hello/assets/…` and fails. Use `/` or a sub-folder like `/app/`.
:::

### A sub-folder needs the router too

`base` moves your **files**, not your **routes**. Under `/app/` the browser is at `/app/about` but your route is `/about`, so the auto-generated router shows the 404 page. Write your own `src/main.js` and give the router the same `root`:

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

Once you create `src/main.js`, routes are no longer generated from your folders. You maintain the list yourself. See [The Router](/docs/router/router#opting-out--your-own-mainjs).
