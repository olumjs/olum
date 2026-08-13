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

## Several events on one element

An element can carry as many `on*` attributes as you need — each is wired as its own listener:

```html title="Component.html"
<input oninput="draft($event)" onblur="save()" onkeydown="hotkey($event)" />

<div onmousedown="startDrag($event)" onmousemove="drag($event)" onmouseup="endDrag()">
  drag me
</div>
```

Across re-renders a listener is **kept** as long as its binding is unchanged; it's only swapped when the handler — or a value baked into it, like a loop variable — actually changes. Reach for [`onMount`](/docs/lifecycle) only for listeners that aren't on one of your own elements (`window`, `document`) or that need options like `capture` / `passive`.

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
