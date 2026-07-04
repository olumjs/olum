---
title: Loops
group: Template Syntax
order: 80
---

`each` is a JS expression. Three forms — array, numeric range, object keys:

```html title="Component.html"
<!-- array: "item of list" -->
<for each="fruit of state.fruits">
  <li>{fruit.name}</li>
</for>

<!-- numeric range: "i of N"  (i goes 1 → N, not 0-based) -->
<for each="i of 6">
  <span>Step {i}</span>
</for>

<!-- object keys: "key in obj" -->
<for each="key in state.settings">
  <div>{key}: {state.settings[key]}</div>
</for>
```

## Keyed loops — `key`

When the loop body contains a **component**, add `key` so each instance is reused by identity across reorders/insertions/removals instead of by position:

```html title="Component.html"
<for each="todo of state.todos" key="todo.id">
  <TodoRow todo="{todo}" />
</for>
```

:::note
`key` only matters for **component** loops. On a loop of plain elements there is no per-item instance to preserve, so `key` is a harmless no-op.
:::
