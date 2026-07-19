---
title: Programmatic Navigation
group: Routing
order: 212
---

The [`to` attribute](/docs/navigating-with-to) covers links, but sometimes navigation happens from **code** — after a form submit, a successful login, a timeout. For that, import the navigation helpers from `olum`:

```js
import { push, replace, back, forward, go, pathname } from "olum";
```

Each helper delegates to the active router instance and works in **both** `hash` and `history` mode — paths are resolved against the router's `root` for you.

| Helper | Action | History stack | Native equivalent |
|--------|--------|---------------|-------------------|
| `push(path)` | Navigate to a new URL | Adds a new entry | `history.pushState()` |
| `replace(path)` | Navigate to a new URL | Overwrites the current entry | `history.replaceState()` |
| `back()` | Move backward one step | Rewinds current position | `history.back()` |
| `forward()` | Move forward one step | Advances current position | `history.forward()` |
| `go(n)` | Move by `n` steps (negative = back) | Jumps to a specific index | `history.go(n)` |
| `pathname()` | Read the current route path | — | `location.pathname` |

## Example

```html title="src/login/page.html"
<script>
  import { replace, back } from "olum";

  const login = () => {
    // ...authenticate...
    // `replace` so the login page doesn't stay in history —
    // pressing Back afterwards won't return to the form.
    replace("/dashboard");
  };

  const cancel = () => back();
</script>

<form>
  <button type="button" onclick="login()">Sign in</button>
  <button type="button" onclick="cancel()">Cancel</button>
</form>
```

## `push` vs `replace`

Both navigate to a new route; the difference is what the **Back button** does afterwards:

- `push("/cart")` — adds an entry, so Back returns to the page you came from. This is what a normal link click does.
- `replace("/dashboard")` — swaps the current entry, so the page you were on disappears from history. Use it for redirects (login flows, deprecated URLs) where returning to the intermediate page makes no sense.

## Reading the current route

`pathname()` returns the current route path, normalized the same way the router matches it — leading slash, no trailing slash, and in hash mode the part after `#`:

```js
import { pathname } from "olum";

if (pathname() === "/checkout") {
  // ...
}
```

:::tip
For **links**, prefer the [`to` attribute](/docs/navigating-with-to) — it also gives you [active-link styling](/docs/active-link-styling) for free. Reach for these helpers only when navigation is triggered by logic rather than a click on a link.
:::
