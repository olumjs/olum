---
title: Limitations
group: Advanced
order: 220
---

OlumJS is deliberately small, and a few rough edges come with that. Here's what to watch for today — each has a straightforward workaround by design.

## 1. Re-renders rebuild the whole stateful component

When a component has `state` and it changes, Olum rebuilds that **entire target component — including its inner child components**. Any live DOM state that Olum doesn't track is lost in the rebuild: a playing `<video>` restarts, a running animation resets, and focused/typed-in `form` inputs lose their value and focus.

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

## 2. Reactive state is one level deep

`state` is wrapped in a shallow proxy: only assignments to its **top-level keys** are detected. Mutating nested data in place — `state.user.name = "Bo"`, `state.todos.push(t)`, `state.todos[0].done = true` — updates the object but triggers **no re-render and no watcher**.

**Avoid it by design:** treat nested data as immutable and assign a **fresh value** to the top-level key:

```js
// ✗ silent — the proxy never sees these
state.user.name = "Bo";
state.todos.push(todo);

// ✓ top-level assignment with a new reference
state.user = { ...state.user, name: "Bo" };
state.todos = [...state.todos, todo];
state.todos = state.todos.map(t => t.id === id ? { ...t, done: true } : t);
```

Note that re-assigning the **same reference** (`state.todos = state.todos`) is also skipped as a no-op — the new value must be a different reference. See [State & Reactivity](/docs/state).

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

## 8. Global store ergonomics

There is already a **global store across the whole application**, together with the [scope system](/docs/scope) (private/public attributes on the `<script>` tag) for exposing props/methods. It's a little awkward in practice, though: a registered component's name isn't straightforward, so you reach it through its location key — e.g. `olum.app.store["page>App#0"]`.

**For now:** use a single dedicated component for your store, put your props/methods in it, and access it by its location key.

```html title="store.html"
<!-- A dedicated store component that exposes its props/methods -->
<!-- App.html (mounted at src/page.html) -->
<script public>
  const user = { name: "Ann" };
  const login = () => { /* … */ };
</script>

// Access it elsewhere by its registered location key:
olum.app.store["page>App#0"].user;
olum.app.store["page>App#0"].login();
```
