---
title: Store Reactivity & Batching
group: Store
order: 240
---

The store follows the same deep-reactivity rules as [component state](/docs/state), with one deliberate difference in **when** re-renders happen: store writes are batched.

## Subscriptions are automatic

A component subscribes to a store by **reading it while rendering** — an interpolation, a directive expression, anything the template evaluates:

```html title="Basket.html"
<script>
  import { cart } from "./store";
</script>

<p>{cart.items.length} items</p>  <!-- this read subscribes Basket to cart -->
```

There's nothing to clean up: when a subscribed component leaves the DOM, its subscription is dropped on the next store change. And if a parent and its child both read the same store, only the **parent** re-renders — re-rendering it rebuilds the child anyway, so the work isn't done twice.

## Reactivity is deep

Nested plain objects, arrays, `Map` and `Set` are all tracked — mutate them in place and subscribers re-render:

```js
cart.items.push(item);           // ✓ in-place array method
cart.items[0].qty = 2;           // ✓ any depth
cart.meta.coupon = "SAVE10";     // ✓ nested object
cart.tags.add("gift");           // ✓ Map/Set mutators
```

Non-plain objects (`Date`, DOM nodes, class instances) pass through **untracked** — after changing one, assign it back to its key to trigger a re-render.

:::warn
Writes that change nothing are skipped: setting a key to the value it already has (including re-assigning the **same reference**, `cart.items = cart.items`) does not re-render. To force a refresh, assign a fresh object or array (spread, `map`, `filter`, `slice`, …).
:::

## Writes are microtask-batched

Component `state` emits synchronously, once per mutation. The store instead **collects every write in the current tick and paints once**, on the next microtask:

```js
export const cart = store({
  items: [],
  checkout() {
    this.items = [];
    this.meta.coupon = null;
    this.meta.lastOrder = Date.now();
    // three writes, ONE re-render
  },
});
```

This is why the store is the right home for **large or frequently-mutated collections**: even an in-place `splice` on a huge array — which under component `state` costs one synchronous rebuild per shifted element — paints exactly once.

The flip side: the DOM is not updated **immediately** after a write. If code right after a mutation needs to read the updated DOM, wait a microtask first (`await Promise.resolve()`).
