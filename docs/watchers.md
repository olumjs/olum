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
