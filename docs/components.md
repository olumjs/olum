---
title: Components & Props
group: Components
order: 130
---

Use a component by its **PascalCase** tag. Import it in `<script>`.

```html title="Parent.html"
<script>
  import StatusBadge from "./StatusBadge";
  import CounterCard from "./CounterCard";
  const state = { score: 5, name: "Ann" };
</script>

<StatusBadge label="Online" color="#16a34a" />
<CounterCard title="Counter" initialValue="{state.score}" />
```

## Props rule

A prop is a **literal string by default**; a whole-value `prop="{expr}"` passes the expression's **real value/type**; `{}` inside text yields an interpolated string.

```html title="Parent.html"
<Comp
  title="Hello"               <!-- "Hello"     → string                -->
  count="{n + 1}"             <!-- 6           → number (type kept)    -->
  data="{state.user}"         <!-- {...}       → object (type kept)    -->
  greet="Hi {state.name}"     <!-- "Hi Ann"    → interpolated string   -->
/>
```

## Reading props in the child

`props()` is imported from `olum` and returns this instance's current props. Call it directly at the **top level** of `<script>` — no `onMount()` required.

```html title="StatusBadge.html"
<!-- StatusBadge.html -->
<script>
  import { props } from "olum";
  const { label, color } = props(); // destructured once, at creation → INITIAL value
</script>
<span class="badge" style="color:{color}">{label}</span>
```

Destructuring takes a one-time **snapshot**. To always read the **latest** value — e.g. after the parent re-renders with new props — call `props()` again, right where you need it:

```html title="StatusBadge.html"
<span class="badge" style="color:{props().color}">{props().label}</span>
```

## Prop write-back (two-way to parent)

If a prop is passed a `state.X` (or another component's `props().X`), the child can assign to it through `props()` and the change propagates up to the owner:

```html title="CounterCard.html"
<!-- parent -->
<CounterCard initialValue="{state.score}" />

<!-- CounterCard.html: writing props().initialValue updates the parent's state.score -->
<script>
  import { props } from "olum";
  const inc = () => { state.count++; props().initialValue = state.count; };
</script>
```

:::warn
Write back through `props().x = value`, not a destructured local. `const { x } = props()` is a frozen snapshot — reassigning that local const doesn't propagate anywhere.
:::
