---
title: Props & Methods Scope
group: Components
order: 160
---

A component's top-level `const` props and methods are **private by default** — encapsulated to the component. Add scope attributes to the `<script>` opening tag to selectively make them public.

```html title="Component.html"
<!-- No scope attributes → every prop and method is PRIVATE (encapsulated). -->
<script>
  const name  = "Ann";
  const age   = 30;
  const greet = () => "Hi " + name;
</script>
```

## Visibility keywords

Six keywords toggle whole groups. The bare `public` / `private` forms apply to **both** props and methods; the `-props` / `-methods` forms target one dimension.

```html title="Component.html"
<!-- Expose all props AND methods -->
<script public> … </script>

<!-- Expose all props only (methods stay private) -->
<script public-props> … </script>

<!-- Expose all methods only (props stay private) -->
<script public-methods> … </script>

<!-- Explicitly private (the default) — both dimensions -->
<script private> … </script>
<script private-props> … </script>
<script private-methods> … </script>
```

## Exceptions — `exclude-*`

An `exclude-<name>` attribute carves an exception out of the **currently open** visibility group — it flips that one member to the opposite visibility:

| Open group | `exclude-x` does |
|------------|------------------|
| `public` / `public-props` / `public-methods` | makes `x` private (removed from the public set) |
| `private` / `private-props` / `private-methods` | makes `x` public (the one member that's surfaced) |

```html title="Component.html"
<script public-props exclude-age exclude-name private-methods exclude-get-age>
  const age     = 30;
  const name    = "Ann";
  const role    = "admin";

  const getAge  = () => age;
  const getRole = () => role;
</script>

<!--
  props:   public  EXCEPT age, name   →  role is public; age + name private
  methods: private EXCEPT getAge      →  getAge is public; getRole private
-->
```

## Order matters

Attributes are read **left to right**. A visibility keyword "opens" a group; every following `exclude-*` attaches to it until the next keyword opens a new group.

```text title="reading order"
['public-props', 'exclude-age', 'exclude-name',  'private-methods', 'exclude-get-age']
      ↓               ↓              ↓                 ↓                  ↓
  open props    →   age      →     name          close props      →    getAge
                                                  open methods      close methods (end)
```

## camelCase → kebab-case

HTML attribute names are case-insensitive, so a camelCase prop or method must be written as **kebab-case** in the `exclude-*` name — the compiler converts it back:

```text title="naming"
getAge    →  exclude-get-age
userName  →  exclude-user-name
isActive  →  exclude-is-active
```

:::tip
Reactive `state` is governed by the **props** scope. Exclude the whole reactive object with `exclude-state` under a public-props group to keep it private.
:::
