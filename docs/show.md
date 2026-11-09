---
title: Show / Hide
group: Template Syntax
order: 90
---

Like `<if>`, but the content **stays on the page** and is only hidden:

```html title="Component.html"
<show when="state.visible">
  <div class="panel">Always on the page; only hidden or shown.</div>
</show>
```

Because nothing is removed, a playing `<video>`, a running animation, or text typed in an input all survive being hidden and shown again.

**How it works:** `<show>` becomes a `<div data-o-show>` wrapper. When visible it has `display: contents` (it takes no space, so the children look as if it weren't there). When hidden it has `display: none`.

:::note
- The wrapper is always there, so a CSS rule like `.parent > .panel` won't match. Use `[data-o-show] > .panel` or remove the `>`.
- A `<div>` isn't allowed inside `<table>` or `<select>`, so don't use `<show>` around table rows or options. Use [`<if>`](/docs/conditionals) or a `style` attribute there instead.
:::
