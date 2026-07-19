---
title: Global Store
group: Store
order: 230
---

Component [`state`](/docs/state) lives and dies with its component. For state **shared across components** — a cart, the signed-in user, app settings — Olum ships a zustand-style global store: define it **once** in a plain `.js` module, import it anywhere, and every component that reads it re-renders automatically when it changes.

```js title="store.js"
import { store } from "olum";

export const cart = store({
  items: [],
  add(name) {
    this.items.push(name);
  },
  clear() {
    this.items = [];
  },
});
```

State and the actions that mutate it live in the **same object** — methods reach the state through `this`. Then any component, in any file, imports it like a normal module. One component writes:

```html title="Shelf.html"
<script>
  import { cart } from "./store";

  const products = ["Compass", "Canteen", "Rope"];
</script>

<for each="product of products">
  <button onclick="cart.add(product)">Add {product}</button>
</for>
```

…and a different component reads — always in sync, with no props and no event forwarding:

```html title="Basket.html"
<script>
  import { cart } from "./store";
</script>

<p>
  <strong>{cart.items.length}</strong>
  {cart.items.length === 1 ? "item" : "items"} in the basket
</p>

<if when="cart.items.length">
  <ul>
    <for each="name of cart.items">
      <li>{name}</li>
    </for>
  </ul>
  <button onclick="cart.clear()">Empty basket</button>
</if>
```

No providers, no wiring: a component **subscribes by reading** the store during render. When the store changes, every subscribed component still in the DOM re-renders; components that only *write* (and never read) are untouched.

:::tip
A store module is just a `.js` file — only `page.html` files become routes, so keep it wherever it reads best: next to the pages that share it, or in `utils/` for app-wide stores.
:::

## Actions

Use **method shorthand** (`add() {}`), not arrow functions — arrows don't bind `this`, so they can't reach the store's state:

```js
export const cart = store({
  items: [],
  add(item) { this.items.push(item); },     // ✓ method — `this` is the store
  clear: () => (this.items = []),           // ✗ arrow — `this` is NOT the store
});
```

Mutating from outside an action works too — `cart.items = []` in a component handler is fine. Actions are a convention for keeping the logic next to the data, not a requirement.

:::note
`store(init)` takes a **plain object** — the same rule as component `state`. Class instances aren't accepted as the store root.
:::

One store per concern beats one giant store: each is just an export, so split freely (`cart.js`, `session.js`, `settings.js`) and let components import only what they read.

:::note
`store` ships in the separate `olum-store` package, which `olum` auto-loads — nothing to set up. If the package is removed from the project, calling `store()` throws `"store is unavailable"`; the rest of the framework keeps working.
:::
