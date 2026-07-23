---
title: Show / Hide
group: Template Syntax
order: 70
---

Like `<if>`, but keeps the content in the DOM and only toggles its visibility.

```html title="Component.html"
<show when="state.visible">
  <div class="panel">Always in the DOM; only visibility toggles.</div>
</show>
```

`<show>` compiles to **one stable wrapper** — `<div data-o-show>` — whose `display` flips between `contents` (visible: the wrapper generates no layout box, so children lay out as if it weren't there) and `none` (hidden). Because the structure is identical in both states, toggling only rewrites that one style — the content nodes are never replaced, so a playing `<video>`, a running animation, or text typed into an input all survive hide/show.

:::note
The wrapper is present in **both** states, so CSS with direct-child combinators through it (`.parent > .panel`) won't match — target `[data-o-show] > .panel` or drop the `>`. And since a `<div>` is invalid inside `<table>`/`<select>` structures, don't wrap table rows or options in `<show>` — use [`<if>`](/docs/conditionals) or a style binding there instead.
:::
