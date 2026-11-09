---
title: Attributes
group: Template Syntax
order: 70
---

## Normal attributes: text with `{ }` inside

Write attributes like in plain HTML. Add `{expr}` **inside the quotes** for the parts that change:

```html title="Component.html"
<div class="card {state.active ? 'is-active' : ''}"></div>
<a href="/users/{state.user.id}" title="Open {state.user.name}">Profile</a>
<img src="/avatars/{state.user.id}.png" alt="avatar" />
<input id="field-{state.index}" type="text" />

<!-- inline style is just text too (use CSS names like background-color) -->
<div style="color:{state.color}; background:{state.bg}; padding:8px;">box</div>
```

## Code attributes: no `{ }` needed

A few attributes hold JavaScript directly: `when`, `each`, `key`, `on*` (events) and `html`. Each has its own page.

```html title="Component.html"
<if when="state.count > 0"> … </if>
<button onclick="inc()">+</button>
```

:::tip[The one rule to remember]
Is the attribute **code** or **text**? HTML already tells you: `onclick=""` is code, `class=""` is text. Code attributes (`when`, `each`, `key`, `on*`, `html`) take JavaScript directly. Everything else is text, with `{ }` for the parts that change.
:::

## Boolean attributes

For attributes like `disabled` or `checked`, the browser only checks if the attribute **exists**: `checked="false"` is still checked! So when the whole value is one `{expr}`, Olum **adds** the attribute when it's truthy and **removes** it when it's falsy:

```html title="Component.html"
<button disabled="{state.busy}">Save</button>
<input type="checkbox" checked="{state.on}" />
<details open="{state.expanded}">…</details>
```

This works for: `checked`, `disabled`, `selected`, `readonly`, `required`, `hidden`, `autofocus`, `multiple`, `open`, `loop`, `muted`, `controls`, `autoplay`, `novalidate`, `default`, `defer`, `ismap`, `reversed`.

:::note
The value must be **exactly one** `{expr}`. Something like `checked="a {b}"` makes no sense for a boolean attribute.
:::

## File URLs start with `/`

`src`, `href` and CSS `url()` pointing to files in `public/` must start with `/`: write `/assets/logo.svg`, never `assets/logo.svg`. Otherwise they break in production. See [Static Assets](/docs/static-assets).
