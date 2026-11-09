---
title: クイックリファレンス
group: 応用
order: 290
source: 58a739c8785f
---

Olum のテンプレート構文を 1 ページにまとめました：テキスト、属性、イベント、フォーム、条件分岐、ループ、コンポーネント、トランジション、ページのメタデータ。

:::tip[覚えておくべき唯一のルール]
その属性は**コード**ですか、それとも**テキスト**ですか？答えは HTML がすでに教えてくれています：`onclick=""` はコードで、`class=""` はテキストです。コード属性（`when`、`each`、`key`、`on*`、`html`）は `""` の中に JavaScript を直接受け取ります。それ以外はすべてテキストで、変化する部分に `{}` を使います。むき出しの波括弧も、`:` バインディングも、特別なディレクティブもありません。
:::

```html title="cheatsheet.html"
<!-- TEXT (escaped, safe) -->
{state.value}
{a > b ? 'x' : 'y'}

<!-- RAW HTML (trusted content only) -->
<div html="state.articleHtml"></div>
{olum.html(state.snippetHtml)}

<!-- ATTRIBUTES (text + {expr}) -->
<div class="box {state.cls}" style="color:{state.color}" title="Hi {state.name}"></div>

<!-- BOOLEAN ATTRIBUTES (only {expr} → added when truthy, removed when falsy) -->
<button disabled="{state.busy}">Save</button>
<details open="{state.expanded}">…</details>

<!-- FILE URLS (start with /, files live in public/) -->
<img src="/assets/logo.svg" />

<!-- EVENTS (code in "") — HTML tags only; on a component, on* is a prop (see FUNCTION PROPS) -->
<button onclick="save()">Save</button>
<input oninput="(e)=> state.text = e.target.value" />
<input oninput="setValue($event)" />
<form onsubmit="(e)=> { e.preventDefault(); submit() }"></form>
<input oninput="draft($event)" onblur="save()" />   <!-- several on* on one element are fine -->

<!-- FORM BINDING (by hand: read with value/checked/selected, write with an event) -->
<input value="{state.text}" oninput="(e)=> state.text = e.target.value" />
<input type="number" value="{state.n}" oninput="(e)=> state.n = +e.target.value" />
<input type="checkbox" checked="{state.on}" onchange="(e)=> state.on = e.target.checked" />
<input type="radio" checked="{state.pick === 'a'}" onchange="state.pick = 'a'" />
<select onchange="(e)=> state.color = e.target.value">
  <option value="red" selected="{state.color === 'red'}">red</option>  <!-- selected on option, NOT value on select -->
</select>
<select multiple onchange="(e)=> state.picked = Array.from(e.target.options).filter(o=>o.selected).map(o=>o.value)">…</select>
<input type="file" multiple onchange="(e)=> state.files = e.target.files" />   <!-- FileList → Array.from() to loop -->
<input type="date" value="{state.date}" oninput="(e)=> state.date = e.target.value" />  <!-- value is TEXT, not a Date -->
<textarea value="{state.text}" oninput="(e)=> state.text = e.target.value"></textarea>
<div contenteditable="true" oninput="(e)=> state.title = e.target.textContent">{state.title}</div>

<!-- FORMS: validation + submit + FormData (see /docs/forms) -->
<form onsubmit="(e)=> { e.preventDefault(); state.data = Object.fromEntries(new FormData(e.target)) }" onreset="reset()">
  <input name="user" value="{state.user}" oninput="set($event)" oninvalid="(e)=> { e.preventDefault(); state.err = e.target.validationMessage }" required minlength="3" />
  <fieldset disabled="{!state.ship}">…</fieldset>   <!-- disables every field inside -->
  <button type="submit" value="publish">Publish</button>   <!-- e.submitter tells you which button -->
</form>

<!-- CONDITIONALS (removed from the page when false) -->
<if when="state.tab === 'a'">…</if>
<else-if when="state.tab === 'b'">…</else-if>
<else>…</else>

<!-- SHOW (stays on the page, only hidden) -->
<show when="state.visible">…</show>

<!-- LOOPS -->
<for each="item of state.items" key="item.id"><Row item="{item}" /></for>
<for each="i of 6">{i}</for>                                <!-- 1 → 6 -->
<for each="key in state.map">{key}</for>
<for each="(item, index, arr) of state.items">{index}: {item}</for>
<for each="(key, index, value) in state.map">{key} = {value}</for>

<!-- DEBUG -->
<log>{state.user}</log>          <!-- console.log when it first appears + each time user changes; shows nothing -->

<!-- TRANSITIONS (needs olum-transition; works on <if>/<show> and keyed <for> items) -->
<if when="state.visible">
  <transition transition="fade">              <!-- same in + out; built-ins: fade/fly/scale/slide/draw -->
    <p>fades in and out</p>
  </transition>
</if>
<transition in="fly({ y: 200 })" out="fade"><p>…</p></transition>  <!-- different in/out + params -->
<transition flip="{ duration: 300 }"><li>…</li></transition>       <!-- slide to new spot when a keyed list reorders -->
<transition in="receive({ key: id })" out="send({ key: id })" flip><li>…</li></transition>  <!-- crossfade between two keyed lists -->
<!--   in <script>: const _cf = crossfade({ fallback: transitions.scale });
                    const send = (n, p) => _cf[0](n, p);  const receive = (n, p) => _cf[1](n, p); -->

<!-- COMPONENTS + PROPS + SLOT -->
<Card title="Hi" count="{n + 1}" data="{state.obj}">
  <span>slot content → {children}</span>
</Card>

<!-- PROPS (in the child's <script>) -->
const { title, children } = props();  // always up to date
const { size = "md" } = props();      // default when the parent doesn't pass it
{title} {children}                    // use the names anywhere
{props().title}                       // same thing

<!-- FUNCTION PROPS (PascalCase tag = your component, lowercase = real HTML) -->
<!-- pass a NAME only, never inline code -->
<Inner onMessage="{handleMessage}" />  <!-- child: const { onMessage } = props(); onMessage(payload) -->
<Inner onMessage="(e)=> …" />          <!-- ✗ arrives as text -->
<Inner onMessage="{(e)=> …}" />        <!-- ✗ inline fn / obj.fn / fn(arg) → arrives undefined -->
<Row row="{row}" onPick="{pick}" />    <!-- pass the data; the child calls onPick(row.id) -->

<!-- DERIVED VALUES (plain functions) -->
const doubled = () => state.count * 2;
{doubled()}

<!-- host: this component's own element (in onMount / handlers, not at the top of <script>) -->
onMount(() => { host.querySelector("main"); });

<!-- MOUNT / UNMOUNT (embedding in React / Vue — UNDER MAINTENANCE, may change) -->
const app = new Olum();
app.$("#olum-app").use(App);   // $() also takes an element (a React/Vue ref)
app.destroy();                 // runs every cleanup, restores <head>, empties the root

<!-- PAGE METADATA (page.html / not-found.html ONLY — ignored elsewhere, with a warning) -->
<head>
  <title>{post.title} — My Blog</title>                       <!-- {expr} reads the <script> -->
  <meta name="description" content="{post.excerpt}" />        <!-- escaped, like the template -->
  <link rel="canonical" href="https://ex.com/blog/{slug}" />
  <meta property="og:image" content="{post.cover}" />         <!-- same name/property = replaces the shell's tag -->
  <script type="application/ld+json">
    { "@type": "Article", "headline": "{post.title}" }        <!-- plain { = JSON; {expr} only INSIDE "…", inserted raw -->
  </script>
</head>
<!-- merged into public/index.html: same kind of tag replaces in place, new tags are added -->
<!-- updates with the page; each route change resets to public/index.html first, so nothing leaks -->
```
