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
Watchers follow the same [one-level-deep rule](/docs/state) as re-renders: they fire on **top-level key assignment** only. A nested mutation like `state.user.name = "Bo"` or `state.todos.push(t)` won't trigger the watcher — assign a fresh value to the key instead (`state.user = { ...state.user, name: "Bo" }`).
:::
