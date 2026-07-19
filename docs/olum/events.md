---
title: Events
group: Template Syntax
order: 90
---

Native `on*` attributes hold **code** (like real HTML). Two forms:

```html title="Component.html"
<!-- method call(s) -->
<button onclick="inc()">+</button>
<button onclick="inc(), log()">multi</button>

<!-- inline arrow / function (extracted into a method automatically) -->
<input oninput="(e) => state.text = e.target.value" />
<button onclick="e => state.n++">no-paren arrow</button>
```

Pass the DOM event with `$event`:

```html title="Component.html"
<input oninput="setValue($event)" />
```

:::note
Event modifiers (`mode="prevent"`, `stop`, …) are **not** a feature — do it in the handler: `onsubmit="(e)=> { e.preventDefault(); save() }"`.
:::

## One event attribute per element

An element can carry **one** `on*` attribute. If you write several, only one survives — combine the logic into a single handler, or attach extra listeners imperatively in [`onMount`](/docs/lifecycle):

```html title="Component.html"
<!-- ✗ two on* attributes — one is silently dropped -->
<input oninput="draft($event)" onblur="save()" />

<!-- ✓ one on* attribute; the second listener is attached in onMount -->
<script>
  import { onMount } from "olum";
  onMount(() => {
    const input = host.querySelector("input");
    input.addEventListener("blur", save);
    return () => input.removeEventListener("blur", save);
  });
</script>
<input oninput="draft($event)" />
```

## Loop variables just work

A handler written inside a [`<for>`](/docs/loops) can reference the loop variables directly — the per-item value is captured for you, in method calls and inline arrows alike:

```html title="Component.html"
<for each="flavour of state.menu">
  <button onclick="remove(flavour)">{flavour}</button>
  <button onclick="() => state.pick = flavour">pick</button>
</for>
```

:::note
The recognized `on*` names are the standard DOM events (`onclick`, `oninput`, `onchange`, `onkeydown`, …). On a **component** tag, any `on*` name is a [function prop](/docs/components) instead.
:::
