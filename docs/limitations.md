---
title: Limitations
group: Advanced
order: 220
---

OlumJS is deliberately small, and a few rough edges come with that. Here's what to watch for today — each has a straightforward workaround by design.

## 1. Unkeyed loop reorders match nodes by position

An unkeyed `<for>` matches nodes by position. If a loop reorders its items, positional matching repaints each node in place with a neighbour's data, so the node's live state appears to jump to the wrong row. Add [`key`](/docs/loops) and nodes are matched by identity and moved instead — see [Rendering & Updates](/docs/rendering).

## 2. No element refs or actions

There is no `bind:this` and no `use:action` directive. (There **is** a transition/animation
system — see [Transitions](/docs/transitions) for `<transition>`, `flip`, and `crossfade`.) The
workaround for refs and actions is the same: do it imperatively in [`onMount`](/docs/lifecycle),
using `host` to reach this component's own elements, and return a cleanup:

```html title="Component.html"
<script>
  import { onMount } from "olum";
  import { longpress } from "./longpress.js";

  onMount(() => {
    const button = host.querySelector("button");   // "ref" via host
    const action = longpress(button, 2000);        // "action" wired by hand
    return () => action.destroy();                 // cleanup on unmount
  });
</script>

<button>press and hold</button>
```

`onMount` runs once at mount and its cleanup once at unmount — it does **not** re-run on state changes. Because re-renders [patch in place](/docs/rendering), the element you wired stays the same node, so the behavior keeps working. If it needs to react to new state, read that state inside the action's own handlers.

## 3. No special elements (`window` / `document` / `body`)

There is no `<olum:window>`-style element for global listeners. Attach them in `onMount` and remove them in the cleanup:

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

The same pattern covers `document` events (`selectionchange`, …).

## 4. No dynamic component element

There is no `<component is="…">` equivalent. Switch over the known component set with an `if` / `else-if` chain driven by a plain string in state:

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

## 5. Function props travel by name

A component's props are handed over as data, so a function prop only arrives when its value is a plain **name** the compiler can resolve — a top-level function of the parent, or a name destructured from `props()`. An inline arrow, a member expression (`obj.fn`) or a call is silently not a function on the child side:

```html title="Parent.html"
<!-- <Input/> = a component YOU wrote (any PascalCase name), not the HTML <input/> element -->
<Input oninput="{handleInput}" />              <!-- ✓ -->
<Input oninput="(e) => state.text = e" />      <!-- ✗ arrives as a string -->
<Input oninput="{(e) => state.text = e}" />    <!-- ✗ arrives as undefined -->
```

Plain elements are not affected — inline code in `on*` is the normal way to write them ([Events](/docs/events)). To pre-bind data, pass it as its own prop and let the child call the handler with it ([Components & Props](/docs/components)).
