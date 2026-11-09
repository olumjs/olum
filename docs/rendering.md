---
title: Rendering & Updates
group: Reactivity
order: 60
---

You never call a "render" function in Olum. You change [`state`](/docs/state) or a [store](/docs/store/global-store), and the page updates. This page explains what happens in between.

## What happens after a change

1. **The change is noticed.** Changing `state` (at any depth) marks that component for an update. Changing a store marks every component that used that store.
2. **Updates are grouped.** All marked components update **once**, right after your code finishes. `state.a++; state.b++`, or a `splice` that moves 100 rows, is one update.
3. **The new HTML is built off-screen.** Nothing on the page has changed yet.
4. **Only the differences are applied.** Olum compares the new HTML with the page and changes only what's different. Unchanged elements are not touched.

If a parent and its child both need an update at the same time, only the **parent** updates (that updates the child too).

## What survives an update

Unchanged elements are left alone, so everything the browser keeps on them stays:

- focus, the text cursor and text selection
- scroll position (including inside scrollable boxes)
- a playing `<video>` or `<audio>`, running CSS animations and transitions
- `<iframe>` and `<canvas>` content
- anything the template doesn't set, like the value of an input that isn't bound to state
- event listeners (a listener is only replaced when its handler, or a value used in it like a loop variable, changed)

:::tip
That's why Olum has no "keep focus" option to learn. Update freely.
:::

## Only components that need it update

- **Unused keys are skipped.** Olum knows which `state` keys each template reads. Changing a key the template doesn't use (one only used in handlers or `onMount`, say) doesn't update anything.
- **Store use is automatic.** A component follows a store just by *reading* it in its template. Components that only write to a store are never updated by it.
- **Removed components are skipped.** A pending update for a component that's gone (route change, closed `<if>`) is dropped.

## Keys: which element is which

When a list changes, Olum matches old and new elements:

- A component keeps its identity, so it's reused and keeps its state.
- A plain element can get an identity with `key="{item.id}"`, or `key` on its [`<for>`](/docs/loops).
- Keyed elements are **moved**, not re-created (using `moveBefore` when the browser has it, so even a playing video survives).
- Elements without a key are matched by position. Olum can still spot a simple insert or delete, so the rows below aren't rebuilt.

A bigger change without keys (sorting, filtering out several rows) can't be matched that way: rows get repainted with their neighbour's data instead of moving. Add `key` to fix it. See [Limitations](/docs/limitations).

## Inputs are never reset by accident

Olum only writes `value` or `checked` to an input when the **template's** value changed. So typing is never wiped by an unrelated update, but an input bound to state still changes when state does. If it writes to the focused field, the cursor stays where it was. A `<select>` keeps the user's choice unless the template moves `selected`. See [Two-way Binding](/docs/two-way-binding).

## Reading the page right after a change

Because updates are grouped, the page is still old on the line after a change. Apply pending updates now with `flushUpdates()`:

```js
import { flushUpdates } from "olum";

state.count++;
flushUpdates();                           // apply pending updates now
host.querySelector("span").textContent;   // up to date
```

It's safe to call anytime (it does nothing if nothing is pending). Mostly useful in tests or when you need to measure new elements.

:::note
If an update ever fails, Olum logs `patch failed — falling back to full re-render` and rebuilds the component from scratch. The page stays correct, but focus, media and scroll reset. Please report that warning as a bug.
:::
