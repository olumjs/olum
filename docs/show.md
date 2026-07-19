---
title: Show / Hide
group: Template Syntax
order: 70
---

Like `<if>`, but keeps the element in the DOM and toggles `display:none`.

```html title="Component.html"
<show when="state.visible">
  <div class="panel">Always in the DOM; only visibility toggles.</div>
</show>
```

:::note
When `when` is falsy the content stays in the DOM wrapped in a `<div style="display:none">`. The wrapper only exists in the hidden state — avoid CSS that depends on the exact parent/child chain inside `<show>`.
:::
