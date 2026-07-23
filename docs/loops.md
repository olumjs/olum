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

Add `key` to the `<for>` so each item is matched across reorders/insertions/removals **by identity, not by position**. Without it, deleting or reordering an item makes the runtime reuse each DOM node in place and repaint it with a neighbour's data — so anything a node "owns" (a checkbox/checkmark state, a playing video, typed-in text) appears to jump to the wrong row. With `key`, nodes are **moved** and left untouched instead.

`key` is a plain JS expression (no braces, like `each`) that must be unique per item:

```html title="Component.html"
<!-- component loop: each instance's state + DOM follows its item -->
<for each="todo of state.todos" key="todo.id">
  <TodoRow todo="{todo}" />
</for>

<!-- plain-element loop: the repeated <li> is reconciled by identity -->
<for each="todo of state.todos" key="todo.id">
  <li data-done="{todo.done}">{todo.text}</li>
</for>
```

:::note
`key` on `<for>` keys **both** component loops (the component instance is reused) and plain-element loops (the repeated root element is reused). It's applied to each loop's **direct root** only — inner children are never keyed. You can also put `key="{item.id}"` (with braces) directly on a plain element if you prefer; the `<for>` form is just the same thing applied for you.
:::

## The numeric range needs a literal number

`each="i of 6"` compiles to a range **only when the count is written as a literal number**. A dynamic count isn't detected — build the range from it instead:

```html title="Component.html"
<!-- ✗ breaks at runtime: state.n is a number, not an array -->
<for each="i of state.n">…</for>

<!-- ✓ range built from the dynamic count (i goes 1 → n) -->
<for each="i of Array.from({ length: state.n }, (_, k) => k + 1)">…</for>
```
