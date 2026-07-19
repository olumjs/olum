---
title: Conditionals
group: Template Syntax
order: 60
---

`when` is always a JS expression. The element is **added/removed** from the DOM.

```html title="Component.html"
<if when="state.tab === 'a'">
  <p>Tab A</p>
</if>
<else-if when="state.tab === 'b'">
  <p>Tab B</p>
</else-if>
<else>
  <p>Fallback</p>
</else>
```

Comparison operators work as expected:

```html title="Component.html"
<if when="state.count >= 5 && state.count < 10">in range</if>
```
