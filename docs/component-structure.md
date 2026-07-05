---
title: Component File Structure
group: Getting Started
order: 20
---

A component is one `.html` file with up to three parts: `<script>` (logic), `<style>` (scoped CSS), and the template (everything else).

```html title="Counter.html"
<!-- Counter.html -->
<script>
  const state = { count: 0 };
  const inc = () => state.count++;
</script>

<style>
  .counter { font-weight: 700; }
</style>

<div class="counter">
  Count: {state.count}
  <button onclick="inc()">+</button>
</div>
```

- `state`, methods, and any consts destructured from [`props()`](/docs/components) are directly available in the template (same closure).
- `<style>` is automatically **scoped** to the component (the compiler tags the component's elements with a unique attribute).
- Component **tag names are PascalCase** — that's how the compiler tells a component apart from a normal element.
