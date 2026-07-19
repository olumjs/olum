---
title: Static Assets
group: Getting Started
order: 24
---

Static files — images, icons, fonts, downloadable files — live in your project's `public/` directory. Everything in `public/` is served **verbatim at the site root**: `public/assets/logo.svg` is available at `/assets/logo.svg`.

## Always use root-absolute URLs

Reference a public file with a URL that **starts with `/`** — in templates, in component `<style>` blocks, everywhere:

```html title="Component.html"
<!-- ✓ root-absolute — works on every route, in dev and production -->
<img src="/assets/logo.svg" />

<style>
  .icon { background: url(/assets/folder.svg) no-repeat; }
</style>

<!-- ✗ relative — resolves against the CURRENT route URL and 404s in production -->
<img src="assets/logo.svg" />
```

Why: component templates and styles are injected at **runtime**, so the browser resolves their URLs against whatever route the user is on. On a nested route like `/shop/cart`, a relative `assets/logo.svg` becomes a request for `/shop/assets/logo.svg` — which doesn't exist.

:::warn
The dev server is forgiving here — it strips route segments until an asset path matches a real file, so a relative URL *appears* to work during development. Production static hosts don't do that. Always write `/assets/...`.
:::

## Dynamic asset paths work too

Because the URL is just a string, `{expr}` interpolation composes paths freely — keep the leading `/`:

```html title="File.html"
<span style="background-image: url(/assets/{type}.svg)">{name}</span>
```

The [production build](/docs/build-and-deploy) copies every file in `public/` into the final output, so assets referenced from runtime strings like this are always available.

:::note
`public/index.html` is your app shell and `public/main.css` its global stylesheet — both are processed by the build. Everything else in `public/` ships as-is, so don't keep scratch files there.
:::
