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

<!-- BOOLEAN ATTRIBUTES (whole-value {expr} → presence toggle) -->
<button disabled="{state.busy}">Save</button>
<details open="{state.expanded}">…</details>

<!-- ASSET URLS (root-absolute, served from public/) -->
<img src="/assets/logo.svg" />

<!-- EVENTS (code in "", ONE on* attribute per element) -->
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

<!-- DEBUG -->
<log>{state.user}</log>          <!-- console.log(state.user) on mount + each time user changes; renders nothing -->

<!-- TRANSITIONS (enter/leave animation; works on <if>/<show> toggles AND keyed <for> items) -->
<if when="state.visible">
  <transition transition="fade">              <!-- same in+out; built-ins: fade/fly/scale/slide/draw -->
    <p>fades in and out</p>
  </transition>
</if>
<transition in="fly({ y: 200 })" out="fade"><p>…</p></transition>  <!-- separate in/out + params -->
<transition flip="{ duration: 300 }"><li>…</li></transition>       <!-- animate to new spot on keyed reorder -->
<!-- crossfade: const _cf = crossfade({ fallback: transitions.scale }); const send=(n,p)=>_cf[0](n,p); receive=… -->
<transition in="receive({ key: id })" out="send({ key: id })" flip><li>…</li></transition>  <!-- fly between two keyed lists -->

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
const { title, children } = props();  // destructured names stay LIVE (compiled to fresh reads)
const { size = "md" } = props();      // default value when the parent omits it
{title} {children}                    // use the names anywhere — always the LATEST values
{props().title}                       // equivalent direct read

<!-- FUNCTION PROPS (component events) -->
<Inner onMessage="{handleMessage}" />  <!-- child: const { onMessage } = props(); onMessage(payload) -->

<!-- DERIVED VALUES (plain functions) -->
const doubled = () => state.count * 2;
{doubled()}

<!-- host: this component's root element, inside onMount -->
onMount(() => { host.querySelector("main"); });
```

:::tip[The design principle]
OlumJS draws one line: **is the attribute fundamentally code or a string?** Native HTML already answers it (`onclick=""` is code, `class=""` is a string). Code-shaped attributes (`when` / `each` / `key` / `on*` / `html`) take an expression directly in `""`; everything else is a literal string with `{}` for the dynamic bits. No naked braces, no colon-bindings, no special directives to memorize.
:::
