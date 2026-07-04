---
title: Two-way Binding
group: Template Syntax
order: 100
---

There is no `model` attribute — bind manually with a value + `oninput` handler:

```html title="Component.html"
<input
  type="text"
  value="{state.text}"
  oninput="(e) => state.text = e.target.value"
/>
<p>Echo: {state.text}</p>
```
