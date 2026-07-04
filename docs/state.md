---
title: State & Reactivity
group: Reactivity
order: 30
---

Declare reactive state as `const state = { ... }`. **Mutating `state` re-renders** the component.

```html title="Component.html"
<script>
  const state = { count: 0, user: { name: "Ann" } };

  const inc = () => state.count++;                 // reassign / mutate → re-render
  const rename = () => (state.user = { name: "Bo" });
</script>

<p>{state.count} — {state.user.name}</p>
<button onclick="inc()">+</button>
```

:::warn
Only `state` is reactive. Plain `const` / `let` variables are not tracked.
:::
