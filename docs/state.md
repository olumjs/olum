---
title: State & Reactivity
group: Reactivity
order: 30
---

Declare reactive state as `const state = { ... }`. **Assigning to a top-level `state` key re-renders** the component.

```html title="Component.html"
<script>
  const state = { count: 0, user: { name: "Ann" } };

  const inc = () => state.count++;                 // top-level assignment → re-render
  const rename = () => (state.user = { name: "Bo" });
</script>

<p>{state.count} — {state.user.name}</p>
<button onclick="inc()">+</button>
```

:::warn
Only `state` is reactive. Plain `const` / `let` variables are not tracked.
:::

## Derived values are plain functions

There is no separate "computed" concept — a derived value is just a **function** you call in the template. Every re-render re-evaluates it, so it always reflects the current state. Derived functions can call each other:

```html title="Component.html"
<script>
  const state = { count: 1 };

  const doubled = () => state.count * 2;      // derived from state
  const quadrupled = () => doubled() * 2;     // derived from another derived
</script>

<p>{state.count} * 2 = {doubled()}</p>
<p>{doubled()} * 2 = {quadrupled()}</p>
```

## Reactivity is one level deep

Only assignments to **top-level keys** of `state` are tracked. Mutating a nested object or calling an array method in place changes the data but does **not** re-render:

```js
state.user.name = "Bo";     // ✗ nested mutation — no re-render
state.todos.push(todo);     // ✗ in-place array method — no re-render
```

Instead, assign a **new value** to the top-level key:

```js
state.user = { ...state.user, name: "Bo" };   // ✓ re-renders
state.todos = [...state.todos, todo];          // ✓ re-renders
state.todos = state.todos.filter(t => !t.done); // ✓ filter/map/slice return new arrays
```

:::warn
Re-assigning the **same reference** back (`state.todos = state.todos`) is also a no-op — unchanged values are skipped. Always assign a fresh object/array (spread, `map`, `filter`, `slice`, …).
:::
