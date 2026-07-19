---
title: Scoped CSS
group: Advanced
order: 180
---

A component's `<style>` is automatically scoped — selectors only affect that component's elements. Just write normal CSS:

```html title="Component.html"
<style>
  .title { color: #4f46e5; }   /* won't leak to other components */
</style>
<h1 class="title">Hello</h1>
```

Under the hood the compiler tags the component's elements with a unique attribute and rewrites each selector to require it. The attribute attaches to the selector's **last compound** (`p:hover` → `p[data-o-x]:hover`), so a descendant selector like `.card p` still won't reach into a *nested component's* elements — children carry their own scope attribute.

## Opting out — global styles

A selector starting with `:root`, `html`, or `body` is left **unscoped** on purpose — it's the escape hatch for component-declared global styles:

```html title="Component.html"
<style>
  :root { --brand: #25c97e; }        /* global CSS variable */
  body { overflow: hidden; }          /* global while this style is present */
  .panel { color: var(--brand); }     /* scoped as usual */
</style>
```

For app-wide styles that belong to no component, prefer `public/main.css`.

## What else the scoper handles

- **`@keyframes` are per-component** — a keyframes name is renamed to `<name>-<componentName>` (and every `animation` / `animation-name` reference is rewritten to match), so two components can both declare `@keyframes fade` without colliding.
- **`@media`, `@supports`, `@layer`, `@container`** — the rules inside are scoped normally.
- **`@font-face`** — left untouched (it has no selector to scope).
- **CSS comments** are stripped from the output.

## Details worth knowing

- Styles are injected **once per component** into a `<style>` tag in `<head>` (id `olum-style-<Name>`) — the first time any instance renders. Every instance shares it.
- `url(...)` paths in component CSS must be **root-absolute** (`url(/assets/x.svg)`) — the CSS is injected at runtime, so relative paths resolve against the current route and break. See [Static Assets](/docs/static-assets).
- Scoping is per **selector**; the declarations are untouched. There is no `:host`-style selector for the component's own wrapper element — style the elements of your template directly.
