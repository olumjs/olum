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
  const { label, color } = props(); // destructured names stay LIVE — see below
</script>
<span class="badge" style="color:{color}">{label}</span>
```

:::note
Destructuring from `props()` is a **compiler feature** in OlumJS. The compiler rewrites destructured prop variables into live property accesses, so they always reflect the latest prop values.
:::

Concretely: every use of `label`/`color` — in templates, methods, and event handlers alike — compiles into a fresh `props().label` / `props().color` read, so the names stay current after the parent re-renders. Writing `props().color` directly is equivalent; use whichever reads better.

### What stays live

```js
const { color } = props();               // ✓ live everywhere: template, methods, handlers
const { color: c } = props();            // ✓ alias — c reads the parent's `color`
const { size = "md" } = props();         // ✓ default when the parent omits it
const { theme: t = "dark" } = props();   // ✓ alias + default combined
const { children } = props();            // ✓ slot content — live too
const { onChange } = props();            // ✓ function props — live callback
```

Liveness follows normal scoping: a loop variable (`<for each="color of list">`) or a function parameter with the same name shadows the prop inside that scope — the local wins, exactly like plain JavaScript.

### What keeps a one-time snapshot

A few patterns can't be made live — they compile untouched and keep the value from creation time (never an error, just not fresh):

```js
const { a, ...rest } = props();          // ✗ rest is a snapshot (a is still live)
const { user: { name } } = props();      // ✗ nested pattern — snapshot
const { [key]: v } = props();            // ✗ computed key — snapshot
onMount(() => {
  const { a } = props();                 // ✗ not top level of <script> — scoped snapshot
});
const p = props();
const { a } = p;                         // ✗ indirect — destructure props() directly
const { a, b = a } = props();            // ✗ a default referencing another destructured
                                         //   prop reads its stale value — keep defaults
                                         //   self-contained
```

And since [props are read-only](#props-are-read-only-one-way-data-flow), **don't assign** to a destructured name — `color = "x"` throws `Assignment to constant variable`; change parent-owned values through a callback prop instead.

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
  const { onMessage } = props();
  const sayHello = () => onMessage({ text: "Hello!" });
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

A function prop also survives being written inside **another component's slot** — the handler is resolved against the component whose template contains the tag, not the one that happens to render it:

```html title="Page.html"
<script>
  import Section from "./Section";
  import Card from "./Card";
  const pick = (id) => (state.picked = id);
</script>

<!-- Card is authored here but instantiated during Section's render — `pick` still arrives -->
<Section>
  <Card onPick="{pick}" />
</Section>
```

:::note
On a **component** tag, an `on*` name is just a prop like any other — even `onclick`. `<CustomButton onclick="{handleClick}" />` hands the child a function; the child decides when to call it (e.g. from its own `<button onclick="onclick()">`). Only on plain elements is `on*` a real DOM event.
:::

## Props are read-only (one-way data flow)

Data flows **down** through props; changes flow **up** through callbacks. Assigning to `props().x` does nothing except log a console warning — to change a parent-owned value, the parent passes a **callback prop** and the child calls it:

```html title="CounterCard.html"
<!-- parent: owns the value, hands the child a way to request changes -->
<script>
  const state = { score: 0 };
  const setScore = (n) => (state.score = n);
</script>
<CounterCard value="{state.score}" onChange="{setScore}" />

<!-- CounterCard.html: reads the prop, calls the callback to update it -->
<script>
  import { props } from "olum";
  const { value, onChange } = props(); // both live — value is always the latest
  const inc = () => onChange(value + 1);
</script>
```

The owner's `state` assignment triggers the re-render, and the fresh value flows back down as a prop. For a value that **several** components read and write, skip the prop threading entirely and put it in the [global store](/docs/global-store).

See the working example at `/forms/callback-props` (a keypad that edits its parent's passcode via `onChange`).

## Prop names are identifiers

A prop name must be a plain identifier (letters, digits, underscore) — write them in camelCase. A dashed name like `data-x="1"` doesn't parse as you'd expect on a component tag (the dash truncates the name), so reserve dashed attributes for plain elements.
