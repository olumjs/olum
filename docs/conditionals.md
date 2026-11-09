---
title: Conditionals
group: Template Syntax
order: 80
---

Show different HTML depending on a condition. `when` takes a JavaScript expression (no `{ }` needed):

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

Any JavaScript condition works:

```html title="Component.html"
<if when="state.count >= 5 && state.count < 10">in range</if>
```

When the condition is false, the content is **removed** from the page. To only hide it instead, use [`<show>`](/docs/show).
