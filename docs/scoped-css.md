---
title: Scoped CSS
group: Components
order: 190
---

CSS in a component's `<style>` only affects **that component**. Just write normal CSS:

```html title="Component.html"
<style>
  .title { color: #4f46e5; }   /* won't affect other components */
</style>
<h1 class="title">Hello</h1>
```

**How it works:** Olum adds a unique attribute to the component's elements and adds it to each selector (`p:hover` becomes `p[data-o-x]:hover`). Child components have their own attribute, so even `.card p` won't style a `<p>` inside a nested component.

## Global styles

Selectors that start with `:root`, `html` or `body` are **not** scoped. Use them when a component needs global CSS:

```html title="Component.html"
<style>
  :root { --brand: #25c97e; }        /* a global CSS variable */
  body { overflow: hidden; }          /* global while this style is on the page */
  .panel { color: var(--brand); }     /* scoped as usual */
</style>
```

For app-wide styles that don't belong to a component, use `public/main.css`.

## Good to know

- **`@keyframes` are per component.** `@keyframes fade` is renamed to `fade-<ComponentName>` (and your `animation` / `animation-name` are updated to match), so two components can both have a `fade` without clashing.
- **`@media`, `@supports`, `@layer`, `@container`**: the rules inside are scoped as usual.
- **`@font-face`** is left as is.
- **CSS comments** are removed.
- Styles are added **once per component** as a `<style id="olum-style-<Name>">` in `<head>`, the first time it appears. All copies of the component share it.
- `url(...)` must start with `/` (`url(/assets/x.svg)`), otherwise it breaks on nested pages. See [Static Assets](/docs/static-assets).
- There is no `:host` selector for the component's wrapper `<div>`. Style your own elements directly.
