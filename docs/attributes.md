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
