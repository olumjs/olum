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

```html title="StatusBadge.html"
<!-- StatusBadge.html -->
<script>
  import { onMount } from "olum";
  // props.label, props.color
  onMount(() => console.log(props.label));
</script>
<span class="badge" style="color:{props.color}">{props.label}</span>
```

## Prop write-back (two-way to parent)

If a prop is passed a `state.X` (or another `props.X`), the child can assign to it and the change propagates up to the owner:

```html title="CounterCard.html"
<!-- parent -->
<CounterCard initialValue="{state.score}" />

<!-- CounterCard.html: writing props.initialValue updates the parent's state.score -->
<script>
  const inc = () => { state.count++; props.initialValue = state.count; };
</script>
```
