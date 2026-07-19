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

## Details worth knowing

- **The filename is the component name.** `CounterCard.html` compiles to the `CounterCard` component — name the file in PascalCase to match the tag.
- **Every instance renders inside a wrapper `<div>`** created by the runtime — that wrapper is the `host` element you get in [`onMount`](/docs/lifecycle). Keep it in mind when writing CSS around a component tag (e.g. direct-child selectors in the parent).
- **`<script>` and `<style>` are both optional.** A file with only markup is a perfectly valid static component.
