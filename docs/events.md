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
