---
title: Store vs State vs Props
group: Store
order: 250
---

Olum has three ways to get data into a component. They compose — most apps use all three — but each has a clear home turf:

| | [`state`](/docs/state) | [`props`](/docs/components) | [`store`](/docs/global-store) |
|---|---|---|---|
| **Scope** | one component | parent → child | the whole app |
| **Defined in** | the component | the parent's template | a plain `.js` module |
| **Who writes it** | the component itself | nobody — read-only | anyone who imports it |
| **Re-render timing** | synchronous, per mutation | with the parent | microtask-batched |
| **Lifetime** | dies with the component | dies with the child | as long as the app runs |

## Rules of thumb

- **Local first.** If only one component cares — an input draft, an open/closed flag — keep it in `state`. Reaching for the store here just makes private data global.
- **Parent → child is props.** Data flowing *down* one level doesn't need a store; pass it as a [prop](/docs/components), and pass a callback prop when the child needs to report back up.
- **Shared or long-lived is the store.** When two components with no parent/child relationship need the same data (cart + navbar badge), or the data must survive route changes, put it in a store. Navigating away unmounts a page and its `state`; a store keeps its value.
- **Prop-drilling is the tell.** The moment a prop is passed through a component that doesn't use it, move that data to a store and let the leaf import it directly.

## They compose

A page can read a store, derive with plain functions, and hand slices down as props — the child stays store-agnostic and reusable:

```html title="Basket.html"
<script>
  import { cart } from "./store";
  import Row from "./Row";

  const state = { filter: "" };  // local concern: stays state
  const visible = () => cart.items.filter((i) => i.includes(state.filter));
</script>

<input value="{state.filter}" oninput="(e) => state.filter = e.target.value" />
<for each="item of visible()">
  <Row label="{item}" />
</for>
```

Because `Basket` reads `cart` during render, a `cart.add(...)` from **any other component** re-renders it — and its `Row` children get fresh props for free.
