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

## Default values

Plain destructuring defaults give a prop a fallback for when the parent omits it:

```html title="Nested.html"
<!-- Nested.html -->
<script>
  import { props } from "olum";
  const { answer = "a mystery" } = props();
</script>
<p>The answer is {answer}</p>
```

```html title="Parent.html"
<Nested answer="{42}" />   <!-- The answer is 42 -->
<Nested />                 <!-- The answer is a mystery -->
```

:::note
There is **no spread shorthand** (`<Comp {...obj} />`) — pass each field explicitly: `<Info name="{pkg.name}" version="{pkg.version}" />`.
:::

## Function props — component events

A prop can be a **function**. That's how a child talks up to its parent: the parent passes a handler down, the child calls it with any payload.

```html title="Parent.html"
<!-- parent -->
<script>
  import Inner from "./Inner";
  const handleMessage = (payload) => alert(payload.text);
</script>

<Inner onMessage="{handleMessage}" />
```

```html title="Inner.html"
<!-- Inner.html -->
<script>
  import { props } from "olum";
  const sayHello = () => props().onMessage({ text: "Hello!" });
</script>

<button onclick="sayHello()">Click to say hello</button>
```

Forwarding through a middle component is just passing the prop along:

```html title="Outer.html"
<!-- Outer.html — sits between parent and Inner -->
<script>
  import Inner from "./Inner";
  import { props } from "olum";
  const { onMessage } = props();
</script>

<Inner onMessage="{onMessage}" />
```

:::note
On a **component** tag, an `on*` name is just a prop like any other — even `onclick`. `<CustomButton onclick="{handleClick}" />` hands the child a function; the child decides when to call it (e.g. from its own `<button onclick="onclick()">`). Only on plain elements is `on*` a real DOM event.
:::

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
