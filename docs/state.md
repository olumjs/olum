---
title: State & Reactivity
group: Reactivity
order: 30
---

Declare reactive state as `const state = { ... }`. **Mutating `state` re-renders** the component — reactivity is deep, so nested objects, arrays, `Map` and `Set` are tracked too.

```html title="Component.html"
<script>
  const state = { count: 0, user: { name: "Ann" } };

  const inc = () => state.count++;                 // top-level assignment → re-render
  const rename = () => (state.user.name = "Bo");   // nested mutation → re-render too
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

## Reactivity is deep

Nested plain objects, arrays, `Map` and `Set` are tracked too — mutating them in place re-renders just like a top-level assignment:

```js
state.user.name = "Bo";          // ✓ nested object — re-renders
state.user.prefs.theme = "dark"; // ✓ any depth — re-renders
state.todos.push(todo);          // ✓ in-place array method — re-renders
state.todos[0].done = true;      // ✓ re-renders
state.tags.add("new");           // ✓ Map/Set mutators — re-render
```

Non-plain objects (`Date`, DOM nodes, class instances) are **not** tracked — after changing one, assign it back to its top-level key to re-render.

:::warn
Re-assigning the **same reference** back (`state.todos = state.todos`) is a no-op — unchanged values are skipped. To force a re-render without mutating, assign a fresh object/array (spread, `map`, `filter`, `slice`, …).
:::

## Re-renders are batched

[Watchers](/docs/watchers) fire **synchronously, once per mutation**, but **re-renders are batched per microtask**: `state.a++; state.b++` — or an in-place `splice` that shifts many elements — costs a **single** re-render pass, and that pass [patches the DOM in place](/docs/limitations) rather than rebuilding it. Mutate `state` however reads best — including big arrays with `push`/`splice`; there's no perf reason to reach for reassignment or the store.

One consequence: the DOM is **not** updated in the same statement as the write. Code that must read the freshly-rendered DOM immediately after a write can settle pending re-renders explicitly:

```js
state.count++;
window.olum.flushUpdates();          // settle re-renders NOW (mostly useful in tests)
host.querySelector("span").textContent; // fresh
```

## Declare `state` literally

The compiler detects reactive state **syntactically**: it must be a top-level `const state = { ... }` with the object written out in the component. A computed value (`const state = makeState()`) isn't recognized — the object won't be proxied and nothing re-renders.
