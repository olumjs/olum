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

## Deploying

`dist/` is plain static files — host it anywhere (Netlify, Vercel, GitHub Pages, nginx, S3…). One rule matters:

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
