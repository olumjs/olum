---
title: Limitations
group: Advanced
order: 220
---

OlumJS is deliberately small, and a few rough edges come with that. Here's what to watch for today — each has a straightforward workaround by design.

## 1. Re-renders rebuild the whole stateful component

When a component has `state` and it changes, Olum rebuilds that **entire target component — including its inner child components**. Any live DOM state that Olum doesn't track is lost in the rebuild: a playing `<video>` restarts, a running animation resets, and a form input whose value isn't bound to `state` loses what was typed. (The **focused** element is an exception — after a rebuild the runtime restores its focus and caret position, and a bound input re-renders with its value from `state`.)

**Avoid it by design:** keep the reactive `state` **outside** the component that holds the video / animation / form inputs. If that media component stays stateless, it never re-renders and its DOM state is preserved.

```html title="lift-state.html"
<!-- ✗ State lives INSIDE the media/input component.
     Any re-render rebuilds it, so the <video> restarts,
     the animation resets, and typed-in inputs lose value/focus. -->
<!-- MediaBox.html -->
<script>
  const state = { count: 0 };          // mutating this re-renders MediaBox
  const inc = () => state.count++;
</script>
<video src="/clip.mp4" controls></video>
<button onclick="inc()">{state.count}</button>

<!-- ✓ Lift the state OUT to a parent, keep the media/input
     component stateless so it never re-renders. -->
<!-- Parent.html -->
<script>
  const state = { count: 0 };          // re-renders the counter, not the video
  const inc = () => state.count++;
</script>
<MediaBox />                           <!-- stateless → the <video> is safe -->
<button onclick="inc()">{state.count}</button>
```

## 2. State re-renders synchronously — once per mutation

`state` reactivity is [deep](/docs/state) (nested objects, arrays, `Map`, `Set`), and every mutation re-renders **synchronously**. An in-place `splice` / `shift` / `unshift` on a **large** state array therefore rebuilds the component once per shifted element within the same tick. Nothing paints mid-tick, so it's visually invisible — but it costs CPU on big lists.

**Avoid it by design:** assign a fresh array in one step, or keep large / frequently-mutated collections in the [global store](/docs/global-store), whose writes are [microtask-batched](/docs/store-reactivity) so a multi-mutation action — even an in-place `splice` — paints once:

```js
// ✗ on a large state array: one sync rebuild per shifted element
state.todos.splice(0, 1);

// ✓ one re-render — reassign a fresh array
state.todos = state.todos.filter(t => t.id !== id);
```

Also note: re-assigning the **same reference** (`state.todos = state.todos`) is skipped as a no-op — to force a re-render the new value must be a different reference. See [State & Reactivity](/docs/state).

## 3. No element refs, actions, or transitions

There is no `bind:this`, no `use:action` directive, and no transition/animation system. The workaround for all three is the same: do it imperatively in [`onMount`](/docs/lifecycle), using `host` to reach this component's own elements, and return a cleanup:

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

Since a re-render rebuilds the component (limitation #1), `onMount` re-runs afterwards and re-attaches the behavior with the current state — an action's `update()` hook usually isn't needed.

## 4. No special elements (`window` / `document` / `body`)

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

## 5. No dynamic component element

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

## 6. No dimension bindings

There is no built-in binding for an element's `clientWidth` / `clientHeight` (e.g. for responsive SVG charts). Use fixed dimensions, or set up a `ResizeObserver` yourself in `onMount` and write the measurements into `state`.

## 7. No integrated unit testing

There is no testing framework wired into OlumJS yet — no built-in test runner or component testing utilities. You can still test plain JS logic with any external tool, but there's no first-class story for testing components at the moment.
