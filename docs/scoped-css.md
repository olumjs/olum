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
