---
title: Loops
group: Template Syntax
order: 100
---

Repeat HTML with `<for>`. `each` takes a JavaScript expression (no `{ }` needed). There are three forms:

```html title="Component.html"
<!-- array: "item of list" -->
<for each="fruit of state.fruits">
  <li>{fruit.name}</li>
</for>

<!-- count: "i of N" (i goes 1 → N, not from 0) -->
<for each="i of 6">
  <span>Step {i}</span>
</for>

<!-- object keys: "key in obj" -->
<for each="key in state.settings">
  <div>{key}: {state.settings[key]}</div>
</for>
```

## Getting the index

Use parentheses to also get the **index** (from 0) and the **array**, like `Array.map`:

```html title="Component.html"
<for each="(cat, index, arr) of state.cats">
  <li>{index + 1}/{arr.length}: {cat.name}</li>
</for>
```

The extra names are optional: `(cat, index)` works too.

For objects, you get `(key, index, value)`, where `value` is `obj[key]`:

```html title="Component.html"
<for each="(key, index, value) in state.settings">
  <div>{index}. {key} = {value}</div>
</for>
```

In the count form (`i of 6`) only the first name is useful, since `i` already counts 1 → 6.

## Keys: add one when items can move

Add `key` so Olum knows which item is which when the list is reordered, or items are added or removed.

**Without a key**, deleting or moving an item makes Olum reuse rows by position and fill them with a neighbour's data. Anything a row "owns" (a checked box, a playing video, typed text) seems to jump to the wrong row. **With a key**, rows are moved instead.

`key` is a JavaScript expression (no `{ }`) that must be unique per item:

```html title="Component.html"
<!-- with components: each one keeps its own state -->
<for each="todo of state.todos" key="todo.id">
  <TodoRow todo="{todo}" />
</for>

<!-- with plain elements -->
<for each="todo of state.todos" key="todo.id">
  <li data-done="{todo.done}">{todo.text}</li>
</for>
```

:::note
The key goes on the element directly inside `<for>` only, not on deeper children. You can also write `key="{item.id}"` (with braces) on a plain element yourself; the `<for>` form just does it for you.
:::

## The count must be a written number

`each="i of 6"` only works when the number is written right there. A number from state won't work. Build an array instead:

```html title="Component.html"
<!-- ✗ breaks: state.n is a number, not an array -->
<for each="i of state.n">…</for>

<!-- ✓ i goes 1 → n -->
<for each="i of Array.from({ length: state.n }, (_, k) => k + 1)">…</for>
```
