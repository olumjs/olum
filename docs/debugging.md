---
title: Debugging
group: Template Syntax
order: 150
---

## `<log>`: print a value when it changes

Put `<log>{expr}</log>` anywhere in your template. It runs `console.log(expr)` when the component first appears and **every time that value changes**. It shows nothing on the page. (Like Svelte's `{@debug}`.)

```html title="Component.html"
<script>
  const state = { user: { firstname: "Ada", lastname: "Lovelace" } };
</script>

<input value="{state.user.firstname}" oninput="(e) => state.user.firstname = e.target.value" />

<log>{state.user}</log>

<h1>Hello {state.user.firstname}!</h1>
```

Open the browser console and type in the field: `user` is logged on each change.

- Log several values with commas: `<log>{state.a, state.b}</log>` becomes `console.log(state.a, state.b)`.
- It only logs when a state key **it reads** changes. `<log>{state.x}</log>` stays quiet when `state.y` changes.

For more control (stop only under a condition), put `debugger;` or `console.log` inside a [watcher](/docs/watchers).
