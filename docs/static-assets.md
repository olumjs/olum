---
title: Static Assets
group: Getting Started
order: 20
---

Put images, icons, fonts and downloads in the `public/` folder. Everything in it is served from the **site root**: `public/assets/logo.svg` is available at `/assets/logo.svg`.

## Always start the URL with `/`

```html title="Component.html"
<!-- ✓ works on every page, in dev and in production -->
<img src="/assets/logo.svg" />

<style>
  .icon { background: url(/assets/folder.svg) no-repeat; }
</style>

<!-- ✗ breaks in production -->
<img src="assets/logo.svg" />
```

**Why:** Olum adds your templates and styles to the page while it runs, so the browser resolves a relative URL against the current page. On `/shop/cart`, `assets/logo.svg` turns into `/shop/assets/logo.svg`, which doesn't exist.

:::warn
The dev server hides this mistake: it tries shorter paths until it finds the file, so a relative URL *seems* to work while you develop. Real hosts don't do that. Always write `/assets/...`.
:::

## Dynamic paths

A URL is just a string, so you can use `{expr}` inside it. Keep the leading `/`:

```html title="File.html"
<span style="background-image: url(/assets/{type}.svg)">{name}</span>
```

The [build](/docs/build-and-deploy) copies every file in `public/` to the output, so files used this way are always there.

## Site not at the domain root?

Still write `/assets/...`. If you set a [`base`](/docs/build-and-deploy#base-url) other than `/` (a sub-folder, a CDN, a `file://` desktop app), the build fixes `src`, `href` and `poster` values that point to a real file in `public/` for you.

:::warn
Two things are **not** fixed and stay as `/...`: `url(...)` inside a component `<style>`, and paths built at runtime like `url(/assets/{type}.svg)`. With a custom base these will miss. Use a template `src` attribute for those images instead.
:::

:::note
`public/index.html` (your app shell) and `public/main.css` (your global CSS) are processed by the build. Everything else in `public/` is shipped as-is, so don't leave scratch files there.
:::
