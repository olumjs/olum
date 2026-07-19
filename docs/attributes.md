---
title: Attributes
group: Template Syntax
order: 110
---

## String attributes — default

A literal string; use `{expr}` **inside** for dynamic parts. Native HTML keeps working untouched.

```html title="Component.html"
<div class="card {state.active ? 'is-active' : ''}"></div>
<a href="/users/{state.user.id}" title="Open {state.user.name}">Profile</a>
<img src="/avatars/{state.user.id}.png" alt="avatar" />
<input id="field-{state.index}" type="text" />

<!-- dynamic inline style is just a string with {expr} (kebab-case CSS) -->
<div style="color:{state.color}; background:{state.bg}; padding:8px;">box</div>
```

## Code attributes — value is an expression

`when`, `each`, `key`, `on*`, and `html` evaluate their `""` value as JS (covered in their own sections).

```html title="Component.html"
<if when="state.count > 0"> … </if>
<button onclick="inc()">+</button>
```

## Boolean attributes — presence, not value

For HTML's boolean attributes the browser only checks **presence** (`checked="false"` is still checked). So when the whole value is a single `{expr}`, the compiler emits the attribute when the expression is truthy and omits it entirely when falsy:

```html title="Component.html"
<button disabled="{state.busy}">Save</button>
<input type="checkbox" checked="{state.on}" />
<details open="{state.expanded}">…</details>
```

Recognized names: `checked`, `disabled`, `selected`, `readonly`, `required`, `hidden`, `autofocus`, `multiple`, `open`, `loop`, `muted`, `controls`, `autoplay`, `novalidate`, `default`, `defer`, `ismap`, `reversed`.

:::note
The toggle only applies when the value is **exactly one** `{expr}` — a mixed value like `checked="a {b}"` is meaningless for a boolean attribute.
:::

## Asset URLs start with `/`

`src`, `href`, and CSS `url()` values pointing at files in `public/` must be **root-absolute** — `/assets/logo.svg`, never `assets/logo.svg`. Relative URLs resolve against the current route and 404 in production — see [Static Assets](/docs/static-assets).
