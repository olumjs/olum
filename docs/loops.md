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

## Index and array — `(item, index, arr)`

Wrap the loop params in parentheses to also receive the **index** (0-based) and the **array itself** — same signature as `Array.prototype.map`:

```html title="Component.html"
<for each="(cat, index, arr) of state.cats">
  <li>{index + 1}/{arr.length}: {cat.name}</li>
</for>
```

Extra params are optional — `(cat, index)` works too.

The `in` (object) form takes `(key, index, value)`, where `value` is a shortcut for `obj[key]`:

```html title="Component.html"
<for each="(key, index, value) in state.settings">
  <div>{index}. {key} = {value}</div>
</for>
```

:::note
In the numeric-range form (`i of 6`) only the first param is meaningful — `i` already counts 1 → N.
:::

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
