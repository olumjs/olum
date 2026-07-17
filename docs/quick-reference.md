---
title: Quick Reference
group: Advanced
order: 230
---

A condensed cheat-sheet covering all template syntax at a glance.

```html title="cheatsheet.html"
<!-- TEXT (auto-escaped) -->
{state.value}
{a > b ? 'x' : 'y'}

<!-- RAW / UNESCAPED HTML (opt out of escaping) -->
<div html="state.articleHtml"></div>
{olum.html(state.snippetHtml)}

<!-- STRING ATTRIBUTES (literal + {expr}) -->
<div class="box {state.cls}" style="color:{state.color}" title="Hi {state.name}"></div>

<!-- EVENTS (code in "") -->
<button onclick="save()">Save</button>
<input oninput="(e)=> state.text = e.target.value" />
<input oninput="setValue($event)" />
<form onsubmit="(e)=> { e.preventDefault(); submit() }"></form>

<!-- FORM BINDINGS (manual two-way) -->
<input value="{state.text}" oninput="(e)=> state.text = e.target.value" />
<input type="number" value="{state.n}" oninput="(e)=> state.n = +e.target.value" />
<input type="checkbox" checked="{state.on}" onchange="(e)=> state.on = e.target.checked" />
<input type="radio" checked="{state.pick === 'a'}" onchange="state.pick = 'a'" />
<select onchange="(e)=> state.color = e.target.value">
  <option value="red" selected="{state.color === 'red'}">red</option>  <!-- selected on option, NOT value on select -->
</select>

<!-- CONDITIONALS -->
<if when="state.tab === 'a'">…</if>
<else-if when="state.tab === 'b'">…</else-if>
<else>…</else>

<!-- SHOW -->
<show when="state.visible">…</show>

<!-- LOOPS -->
<for each="item of state.items" key="item.id"><Row item="{item}" /></for>
<for each="i of 6">{i}</for>
<for each="key in state.map">{key}</for>
<for each="(item, index, arr) of state.items">{index}: {item}</for>
<for each="(key, index, value) in state.map">{key} = {value}</for>

<!-- COMPONENTS + PROPS + SLOT -->
<Card title="Hi" count="{n + 1}" data="{state.obj}">
  <span>slot content → {children}</span>
</Card>

<!-- PROPS (in the child's <script>) -->
const { title, children } = props();  // INITIAL snapshot, no onMount needed
const { size = "md" } = props();      // default value when the parent omits it
{props().title}                       // LATEST value, call anywhere (template or method)
{props().children}                    // LATEST slot content

<!-- FUNCTION PROPS (component events) -->
<Inner onMessage="{handleMessage}" />  <!-- child calls: props().onMessage(payload) -->

<!-- DERIVED VALUES (plain functions) -->
const doubled = () => state.count * 2;
{doubled()}

<!-- host: this component's root element, inside onMount -->
onMount(() => { host.querySelector("main"); });
```

:::tip[The design principle]
OlumJS draws one line: **is the attribute fundamentally code or a string?** Native HTML already answers it (`onclick=""` is code, `class=""` is a string). Code-shaped attributes (`when` / `each` / `key` / `on*` / `html`) take an expression directly in `""`; everything else is a literal string with `{}` for the dynamic bits. No naked braces, no colon-bindings, no special directives to memorize.
:::
