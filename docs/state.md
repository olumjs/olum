---
title: State & Reactivity
group: Reactivity
order: 30
---

Put the data your component shows in `const state = { ... }`. **When you change `state`, the page updates by itself.**

```html title="Component.html"
<script>
  const state = { count: 0, user: { name: "Ann" } };

  const inc = () => state.count++;                 // page updates
  const rename = () => (state.user.name = "Bo");   // nested changes update it too
</script>

<p>{state.count} — {state.user.name}</p>
<button onclick="inc()">+</button>
```

:::warn
Only `state` is reactive. Changing a normal `const` or `let` variable does **not** update the page.
:::

## Write `state` as a literal object

It must be a top-level `const state = { ... }` with the object written right there. `const state = makeState()` is not detected, so nothing will update.

## Changes at any depth work

Nested objects, arrays, `Map` and `Set` are all tracked:

```js
state.user.name = "Bo";          // ✓ nested object
state.user.prefs.theme = "dark"; // ✓ any depth
state.todos.push(todo);          // ✓ array methods (push, splice, sort, …)
state.todos[0].done = true;      // ✓ array item
state.tags.add("new");           // ✓ Map / Set
```

Other kinds of objects (`Date`, DOM elements, class instances) are **not** tracked. After changing one, assign a **new** value to its key: `state.date = new Date(state.date)`.

:::warn
Assigning the **same** object back (`state.todos = state.todos`) does nothing, because nothing changed. To force an update, assign a new array or object (`[...state.todos]`, `map`, `filter`, `slice`, `{ ...obj }`).
:::

## Derived values are just functions

Need a value calculated from state? Write a function and call it in the template. It runs again on every update, so it's always current. Functions can call each other:

```html title="Component.html"
<script>
  const state = { count: 1 };

  const doubled = () => state.count * 2;
  const quadrupled = () => doubled() * 2;
</script>

<p>{state.count} * 2 = {doubled()}</p>
<p>{doubled()} * 2 = {quadrupled()}</p>
```

## Updates are grouped

Several changes in a row (`state.a++; state.b++`, or one `splice` on a big array) cause **one** update, not many. And the update only [changes what's different](/docs/rendering) on the page. So change `state` in whatever way reads best; there's no speed reason to avoid `push` or `splice`.

The catch: the page is updated a moment **after** your change, not on the same line. If you need to read the updated page right away (mostly in tests), call `flushUpdates()`:

```js
import { flushUpdates } from "olum";

state.count++;
flushUpdates();                         // apply pending updates now
host.querySelector("span").textContent; // up to date
```

:::note
`window.olum.flushUpdates()` does the same thing, but only in development. In production `window.olum` only has `version` and `framework` (for detection tools), so import `flushUpdates` instead.
:::

[Watchers](/docs/watchers) are different: they run immediately, once per change.

Changing a state key that the template never uses doesn't update the page at all. See [Rendering & Updates](/docs/rendering).
