---
title: Props & Methods Scope
group: Components
order: 210
---

By default, everything inside a component's `<script>` is **private**: other code can't see it. You can make parts of it **public**, so [`scope()`](#reading-a-component-from-outside-scope) can read them from outside.

:::note
On this page, **"props"** means a component's top-level `const` values (not the `props()` a parent passes in), and **"methods"** means its functions.
:::

- **Props**: top-level `const`s with a simple value (a literal, object, array, ternary, or another name).
- **Methods**: top-level functions (`function fn() {}` or `const fn = () => …`).
- Anything else (like `const x = compute()`) still works inside the component, it just can't be made public.
- `state` counts as a prop.

## Making things public

Add a keyword to the `<script>` tag:

```html title="Component.html"
<script public> … </script>            <!-- all props AND methods public -->
<script public-props> … </script>      <!-- only props public -->
<script public-methods> … </script>    <!-- only methods public -->

<script private> … </script>           <!-- everything private (the default) -->
<script private-props> … </script>
<script private-methods> … </script>
```

## Exceptions with `exclude-*`

`exclude-<name>` flips **one** item to the opposite of its group:

| After… | `exclude-x` makes `x`… |
|--------|------------------------|
| `public`, `public-props`, `public-methods` | private |
| `private`, `private-props`, `private-methods` | public |

```html title="Component.html"
<script public-props exclude-age exclude-name private-methods exclude-get-age>
  const age     = 30;
  const name    = "Ann";
  const role    = "admin";

  const getAge  = () => age;
  const getRole = () => role;
</script>

<!--
  props:   public, except age and name  →  role is public
  methods: private, except getAge       →  getAge is public
-->
```

:::tip
To keep `state` private while other props are public, add `exclude-state` after `public-props`.
:::

### Order matters

Attributes are read **left to right**. Each keyword starts a group, and the `exclude-*` after it belong to that group until the next keyword:

```text title="reading order"
public-props   exclude-age   exclude-name   private-methods   exclude-get-age
└──────────── props group ───────────────┘  └──────── methods group ───────┘
```

### Write names in kebab-case

HTML attribute names ignore uppercase, so write camelCase names with dashes. Olum converts them back:

```text title="naming"
getAge    →  exclude-get-age
userName  →  exclude-user-name
isActive  →  exclude-is-active
```

## Reading a component from outside: `scope()`

`scope()` finds a component **on the page** by name, from anywhere (another component, the console, a test):

```js
import { scope } from "olum";

const badge = scope("StatusBadge");
badge.props;    // its PUBLIC props
badge.methods;  // its PUBLIC methods
badge.state;    // its live state (changing it updates that component)
badge.el;       // its root element
badge.key;      // its internal instance key
```

- Several on the page? Pass which one: `scope("Item", 2)`.
- Not found → returns `null` and logs a warning.

:::tip
`scope()` is an escape hatch. For data that several components share on purpose, use the [global store](/docs/store/global-store).
:::
