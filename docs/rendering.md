---
title: Rendering & Updates
group: Reactivity
order: 35
---

You never call a render function in Olum — writing to [`state`](/docs/state) or a [store](/docs/global-store) is the whole API. This page describes what actually happens between that write and the pixels, because a few of its guarantees are worth designing around.

## The update cycle

1. **The write emits.** A `state` mutation (at any depth) marks its component as dirty; a store write marks every component that read that store while rendering.
2. **Rebuilds are batched.** All dirty components are collected and re-rendered **once per microtask** — `state.a++; state.b++`, or a `splice` that shifts a hundred rows, costs a single pass.
3. **The template renders into a detached tree.** The component builds fresh markup off-screen; nothing on the page has moved yet.
4. **The patcher diffs and mutates in place.** The live DOM is updated node by node to match — untouched nodes are never re-created.

If a parent and one of its children are both dirty in the same tick, only the **parent** renders: its pass rebuilds the child anyway.

## What survives a re-render

Because unchanged nodes are left alone, everything the *browser* owns on those nodes keeps going:

- focus and the text caret / selection
- scroll position, including inside nested scrollers
- a playing `<video>` or `<audio>`, and running CSS animations or transitions
- `<iframe>` content and canvas contents
- DOM state your template doesn't set, like an uncontrolled input's value
- event listeners — a listener is only swapped when its binding changed (a different handler, or a different value baked into it, such as a loop variable)

:::tip
This is why there's no "preserve focus" escape hatch to learn: patching in place makes it the default. Re-render freely.
:::

## Only the components that need to render, do

- **Unread keys are skipped.** The compiler records which top-level `state` keys a component's template reads. A write to a key the template never reads doesn't schedule a render at all — so a key used only by handlers or `onMount` is free.
- **Store subscriptions are implicit.** A component subscribes to a store by *reading* it during render. Components that only write to a store are never re-rendered by it.
- **Unmounted components are dropped.** A pending update for a component that left the DOM (a route change, an `<if>` that closed) is discarded rather than applied.

## Identity: keys decide what gets reused

The patcher matches children **by identity where one exists, by position otherwise**:

- a component instance carries its own identity, so it's reused across re-renders and keeps its state
- a plain element opts in with a key — `key="{item.id}"`, or `key` on the [`<for>`](/docs/loops) that repeats it
- keyed nodes are **moved** rather than re-created (via `moveBefore` where the browser supports it, so a playing video survives a reorder)
- unkeyed children are matched positionally, with a short lookahead that recognizes a plain insertion or deletion so the siblings below the change point aren't destroyed

A larger unkeyed reshuffle (a sort, a filter that removes several rows at once) can't be recognized that way — nodes get repainted with a neighbour's data instead of moving. Add `key` and identity does the work; see [Limitations](/docs/limitations).

## Form controls are never clobbered

The patcher only writes a `value` or `checked` to a live input when the **template's** value changed — so typing into a field is never reset by an unrelated re-render, and a controlled input still updates when state moves it. When it does write to a focused field, the caret position is preserved. A `<select>` keeps the user's choice unless the template explicitly moves the `selected` option. See [Two-way binding](/docs/two-way-binding).

## Reading the DOM right after a write

Since rebuilds are batched, the DOM is still stale in the statement after a mutation. Settle everything pending, synchronously:

```js
import { flushUpdates } from "olum";

state.count++;
flushUpdates();                           // run pending re-renders NOW
host.querySelector("span").textContent;   // fresh
```

It's idempotent and safe to call when nothing is pending — mostly useful in tests and in imperative code that has to measure freshly-rendered nodes.

:::note
If a patch ever throws, Olum logs `patch failed — falling back to full re-render` and rebuilds that component's content wholesale. It stays correct, but browser-owned state (focus, media, scroll) resets — so treat that warning as a bug worth reporting.
:::
