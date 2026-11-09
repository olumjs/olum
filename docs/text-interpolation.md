---
title: Text Interpolation
group: Reactivity
order: 40
---

Show a JavaScript value in your HTML by wrapping it in `{ }`. It's always shown as safe text:

```html title="Component.html"
<p>Hello {state.user.name}</p>
<p>Total: {state.items.length} items</p>
<p>{state.count > 0 ? 'positive' : 'zero'}</p>
```

## Good to know

- The value is **HTML-escaped**, so text like `<b>` shows as text, not as HTML. This keeps you safe from XSS. To show real HTML, see [Raw HTML](/docs/raw-html).
- `null` and `undefined` show as nothing.
- There is **no way to escape `{`** in text. Any `{…}` is treated as code. To show a literal `{`, write `{String.fromCharCode(123)}` or put `"{"` in a `const` and show that.
