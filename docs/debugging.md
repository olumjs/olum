---
title: Debugging
group: Template Syntax
order: 130
---

## `<log>{expr}</log>` — log a value on every render

OlumJS's counterpart to Svelte's `{@debug}` tag. The compiler turns it into a
`console.log(expr)` that runs **on the initial render and again every time the logged
value changes**, and it renders nothing to the page.

```html title="Component.html"
<script>
  const state = { user: { firstname: "Ada", lastname: "Lovelace" } };
</script>

<input value="{state.user.firstname}" oninput="(e) => state.user = { ...state.user, firstname: e.target.value }" />

<log>{state.user}</log>

<h1>Hello {state.user.firstname}!</h1>
```

Open the devtools console and edit the field — `user` is logged on each change.

- The expression uses the same `{…}` interpolation braces as everywhere else.
- Multiple comma-separated arguments pass straight through: `<log>{state.a, state.b}</log>`
  compiles to `console.log(state.a, state.b)`.
- It re-fires only when a state key it reads changes (the same dependency gating that
  drives re-renders), so `<log>{state.x}</log>` won't log when an unrelated `state.y`
  changes.

For a persistent, condition-based break instead of a per-render log, a
[`watcher`](watchers.md) with a `debugger;` or `console.log` inside is the imperative
alternative.
