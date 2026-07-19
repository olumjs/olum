---
title: Watchers
group: Reactivity
order: 50
---

Declare `const watcher = { ... }` with a function per `state` key; it fires on change with `(oldValue, newValue)`.

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

:::warn
Watchers fire on **top-level key assignment** only. A nested mutation like `state.user.name = "Bo"` or `state.todos.push(t)` re-renders (reactivity is [deep](/docs/state)) but does **not** fire the watcher — when you need the watcher to run, assign a fresh value to the key (`state.user = { ...state.user, name: "Bo" }`).
:::
