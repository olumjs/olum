---
title: Watchers
group: Reactivity
order: 50
---

A watcher runs your code when a `state` key changes. Declare `const watcher = { ... }` with one function per key. Each function gets the old and the new value:

````html title="Component.html"
<script>
  const state = { count: 0, log: "—" };
  const watcher = {
    count(old, next) {
      state.log = `count: ${old} → ${next}`;
    },
  };
</script>
<p>{state.count} — {state.log}</p>
````

Watchers run **right away**, once per change (page updates are grouped, watchers are not).

:::warn
A watcher only runs when you **assign the key itself**: `state.user = ...`. A nested change like `state.user.name = "Bo"` or `state.todos.push(t)` updates the page but does **not** run the watcher. If you need the watcher, assign a new value: `state.user = { ...state.user, name: "Bo" }`.
:::
