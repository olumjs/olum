---
title: Text Interpolation
group: Reactivity
order: 40
---

Any `{expr}` in **text** is evaluated as JavaScript and **HTML-escaped by default** (XSS-safe).

```html title="Component.html"
<p>Hello {state.user.name}</p>
<p>Total: {state.items.length} items</p>
<p>{state.count > 0 ? 'positive' : 'zero'}</p>
```

- `null` / `undefined` render as an empty string.
- To render unescaped HTML, see [Raw HTML](/docs/raw-html).
- There is **no escape for a literal `{`** in text — any `{…}` is treated as interpolation. Use `{String.fromCharCode(123)}` or a `const` holding `"{"`.
