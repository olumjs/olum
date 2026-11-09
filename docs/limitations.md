---
title: Limitations
group: Advanced
order: 270
---

Olum is small on purpose, so a few things are missing. Each has a simple workaround.

## 1. Lists without `key` match rows by position

If an unkeyed `<for>` list is reordered, rows are repainted with their neighbour's data, so things like a checked box seem to jump to the wrong row. Add [`key`](/docs/loops#keys-add-one-when-items-can-move) and rows are moved instead. See [Rendering & Updates](/docs/rendering#keys-which-element-is-which).

## 2. No element refs or actions

There's no `bind:this` and no `use:action`. Do it yourself in [`onMount`](/docs/lifecycle), use `host` to find the element, and return a cleanup:

```html title="Component.html"
<script>
  import { onMount } from "olum";
  import { longpress } from "./longpress.js";

  onMount(() => {
    const button = host.querySelector("button");   // the "ref"
    const action = longpress(button, 2000);        // the "action"
    return () => action.destroy();                 // cleanup when removed
  });
</script>

<button>press and hold</button>
```

`onMount` runs once, not on every update. That's fine: updates [change elements in place](/docs/rendering), so the button stays the same element and keeps working. If the behavior depends on state, read the state inside its handlers.

(Animations **are** built in. See [Transitions](/docs/transition/transitions).)

## 3. No `<window>` / `<document>` / `<body>` elements

To listen to global events, add the listener in `onMount` and remove it in the cleanup:

```html title="Component.html"
<script>
  import { onMount } from "olum";

  const state = { keys: [] };
  const handleKeydown = (e) => (state.keys = [...state.keys, e.key].slice(-8));

  onMount(() => {
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  });
</script>
```

Same for `document` events like `selectionchange`.

## 4. No dynamic component tag

There's no `<component is="…">`. Use `<if>` / `<else-if>` with a value in state:

```html title="Component.html"
<script>
  import RedThing from "./RedThing";
  import GreenThing from "./GreenThing";
  import BlueThing from "./BlueThing";

  const state = { color: "red" };
</script>

<if when="state.color === 'red'"><RedThing /></if>
<else-if when="state.color === 'green'"><GreenThing /></else-if>
<else><BlueThing /></else>
```

## 5. Function props must be a name

On your own components, a function prop only works when it's a plain **name** (a function in the parent's `<script>`, or one from `props()`). An inline arrow, `obj.fn`, or a call doesn't arrive as a function:

```html title="Parent.html"
<!-- <Input/> = YOUR component, not the HTML <input/> -->
<Input oninput="{handleInput}" />              <!-- ✓ -->
<Input oninput="(e) => state.text = e" />      <!-- ✗ arrives as text -->
<Input oninput="{(e) => state.text = e}" />    <!-- ✗ arrives as undefined -->
```

Normal HTML tags aren't affected: inline code in `on*` is fine there ([Events](/docs/events)). To pass extra data, send it as its own prop and let the child pass it back ([Components & Props](/docs/components#function-props)).
