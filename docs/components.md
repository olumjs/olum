---
title: Components & Props
group: Components
order: 160
---

Import a component in `<script>`, then use it as a **PascalCase** tag. Attributes you give it are its **props**:

```html title="Parent.html"
<script>
  import StatusBadge from "./StatusBadge";
  import CounterCard from "./CounterCard";
  const state = { score: 5, name: "Ann" };
</script>

<StatusBadge label="Online" color="#16a34a" />
<CounterCard title="Counter" initialValue="{state.score}" />
```

## Passing props

```html title="Parent.html"
<Comp
  title="Hello"               <!-- "Hello"   → text                         -->
  count="{n + 1}"             <!-- 6         → a real number                -->
  data="{state.user}"         <!-- {...}     → the real object              -->
  greet="Hi {state.name}"     <!-- "Hi Ann"  → text with a value inside     -->
/>
```

- Plain value → **text**.
- Only `{expr}` and nothing else → the **real value** (number, object, array, function…).
- Text mixed with `{expr}` → **text**.

:::note
There is no spread shortcut (`<Comp {...obj} />`). Pass each field: `<Info name="{pkg.name}" version="{pkg.version}" />`.
:::

Prop names must be simple names in camelCase (letters, digits, `_`). A dashed name like `data-x="1"` doesn't work on a component (the dash cuts the name). Keep dashed attributes for normal HTML tags.

## Reading props in the child

Import `props` from `olum` and take what you need, at the **top** of `<script>`:

```html title="StatusBadge.html"
<script>
  import { props } from "olum";
  const { label, color } = props();
</script>

<span class="badge" style="color:{color}">{label}</span>
```

These names **always have the latest value**. When the parent passes a new value, `label` and `color` update everywhere: in the template, in functions, in event handlers. (Olum turns each use into a fresh `props().label` read for you. Writing `props().label` yourself works too.)

### Default values

Use normal JavaScript defaults for when the parent doesn't pass a prop:

```html title="Nested.html"
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

### What stays up to date

```js
const { color } = props();               // ✓ up to date everywhere
const { color: c } = props();            // ✓ renamed: c is the parent's `color`
const { size = "md" } = props();         // ✓ with a default
const { theme: t = "dark" } = props();   // ✓ renamed + default
const { children } = props();            // ✓ slot content (see Slots)
const { onChange } = props();            // ✓ a function prop
```

A loop variable or function parameter with the same name hides the prop inside that block, just like normal JavaScript.

### What is only read once

These patterns keep the value from when the component was created. They don't error, they just don't update:

```js
const { a, ...rest } = props();          // ✗ rest is not updated (a still is)
const { user: { name } } = props();      // ✗ nested: use const { user } = props(), then user.name
const { [key]: v } = props();            // ✗ computed key: use props()[key]
onMount(() => {
  const { a } = props();                 // ✗ not at the top of <script>
});
const p = props();
const { a } = p;                         // ✗ indirect: destructure props() directly
const { a, b = a } = props();            // ✗ a default that uses another prop gets an old value
```

## Function props

A prop can be a **function**. That's how a child tells its parent something happened: the parent passes a function, the child calls it.

```html title="Parent.html"
<script>
  import Inner from "./Inner";
  const handleMessage = (payload) => alert(payload.text);
</script>

<Inner onMessage="{handleMessage}" />
```

```html title="Inner.html"
<script>
  import { props } from "olum";
  const { onMessage } = props();
  const sayHello = () => onMessage({ text: "Hello!" });
</script>

<button onclick="sayHello()">Click to say hello</button>
```

### Pass a function name, never inline code

A function prop must be a **name**: either a top-level function of this component, or a name you got from `props()` (to pass it further down).

```html title="Parent.html"
<script>
  import Input from "./Input";          // YOUR component (Input.html)
  const handleInput = (e) => (state.text = e.target.value);
</script>

<Input oninput="{handleInput}" />        <!-- ✓ a name -->

<Input oninput="() => console.log(123)" />     <!-- ✗ arrives as the TEXT "() => console.log(123)" -->
<Input oninput="{() => console.log(123)}" />   <!-- ✗ inline function: arrives as undefined -->
<Input oninput="{state.handlers.input}" />     <!-- ✗ not a plain name: arrives as undefined -->
<Input oninput="{makeHandler(id)}" />          <!-- ✗ passes what the call returns, not a function -->
```

Olum doesn't warn you. The child fails with `oninput is not a function` when it calls it. The fix is always the same: give the function a name in `<script>` and pass the name.

:::warn
This rule is **only for your components** (PascalCase). On normal HTML tags (lowercase), `on*` is a real DOM event and inline code is fine ([Events](/docs/events)):

```html title="Component.html"
<input oninput="e => console.log(123)" />    <!-- ✓ HTML <input>: inline code works -->
<Input oninput="e => console.log(123)" />    <!-- ✗ your <Input/> component: needs "{handler}" -->
```

Even `onclick` is just a prop on a component: `<CustomButton onclick="{handleClick}" />` gives the child a function, and the child decides when to call it (e.g. from its own `<button onclick="onclick()">`).
:::

**Need the function to know which item it's for?** You can't pre-fill arguments in the tag. Pass the item as a prop and let the child send it back:

```html title="List.html"
<!-- ✗ doesn't work -->
<for each="row of state.rows" key="row.id">
  <Row onPick="{() => pick(row.id)}" />
</for>

<!-- ✓ pass the row; the child calls onPick(row.id) -->
<for each="row of state.rows" key="row.id">
  <Row row="{row}" onPick="{pick}" />
</for>
```

**Passing it through a middle component** is just passing the prop again:

```html title="Outer.html"
<script>
  import Inner from "./Inner";
  import { props } from "olum";
  const { onMessage } = props();
</script>

<Inner onMessage="{onMessage}" />
```

**Inside another component's slot** it still works. The name is looked up in the file where you wrote the tag:

```html title="Page.html"
<script>
  import Section from "./Section";
  import Card from "./Card";
  const pick = (id) => (state.picked = id);
</script>

<Section>
  <Card onPick="{pick}" />   <!-- `pick` from Page.html arrives fine -->
</Section>
```

## Props are read-only

Data goes **down** through props, and changes go **up** through function props. A child can't change a prop:

- Assigning `props().x = …` does nothing (and logs a warning).
- Assigning a destructured name (`color = "x"`) throws `Assignment to constant variable`.

Instead, the parent passes a function the child calls to ask for the change:

```html title="Parent.html"
<script>
  import CounterCard from "./CounterCard";
  const state = { score: 0 };
  const setScore = (n) => (state.score = n);
</script>

<CounterCard value="{state.score}" onChange="{setScore}" />
```

```html title="CounterCard.html"
<script>
  import { props } from "olum";
  const { value, onChange } = props();
  const inc = () => onChange(value + 1);
</script>

<button onclick="inc()">{value} +1</button>
```

The parent updates its `state`, and the new value flows back down to the child. Working example: [`/forms/callback-props`](/forms/callback-props) (a keypad that edits its parent's passcode).

If **many** components need to read and change the same value, use the [global store](/docs/store/global-store) instead of passing props through every level.
