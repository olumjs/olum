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
    "SSG_DELAY": 500
  }
}
```

`SITE_URL` is the absolute base for every `<loc>` in `sitemap.xml` — without it crawlers ignore the file. `SSG_DELAY` is settling time in milliseconds per route — leave it at `0` unless a page fetches its data in `onMount`. Both are optional and documented in [Prerendering & SEO](/docs/prerendering).

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
