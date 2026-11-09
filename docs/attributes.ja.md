---
title: 属性
group: テンプレート構文
order: 70
source: 85c49fc9c132
---

## 通常の属性：`{ }` を含むテキスト {#normal-attributes-text-with---inside}

普通の HTML と同じように属性を書きます。変化する部分には**引用符の中に** `{expr}` を書きます：

```html title="Component.html"
<div class="card {state.active ? 'is-active' : ''}"></div>
<a href="/users/{state.user.id}" title="Open {state.user.name}">Profile</a>
<img src="/avatars/{state.user.id}.png" alt="avatar" />
<input id="field-{state.index}" type="text" />

<!-- inline style is just text too (use CSS names like background-color) -->
<div style="color:{state.color}; background:{state.bg}; padding:8px;">box</div>
```

## コード属性：`{ }` は不要 {#code-attributes-no---needed}

いくつかの属性は JavaScript を直接持ちます：`when`、`each`、`key`、`on*`（イベント）、`html` です。それぞれに専用のページがあります。

```html title="Component.html"
<if when="state.count > 0"> … </if>
<button onclick="inc()">+</button>
```

:::tip[覚えておくべき唯一のルール]
その属性は**コード**ですか、それとも**テキスト**ですか？答えは HTML がすでに教えてくれています：`onclick=""` はコードで、`class=""` はテキストです。コード属性（`when`、`each`、`key`、`on*`、`html`）は JavaScript を直接受け取ります。それ以外はすべてテキストで、変化する部分に `{ }` を使います。
:::

## 真偽値属性 {#boolean-attributes}

`disabled` や `checked` のような属性について、ブラウザは属性が**存在するかどうか**しか見ません。`checked="false"` でもチェックされた状態になります！そこで値全体が 1 つの `{expr}` のとき、Olum は値が truthy なら属性を**追加**し、falsy なら**削除**します：

```html title="Component.html"
<button disabled="{state.busy}">Save</button>
<input type="checkbox" checked="{state.on}" />
<details open="{state.expanded}">…</details>
```

対象の属性：`checked`、`disabled`、`selected`、`readonly`、`required`、`hidden`、`autofocus`、`multiple`、`open`、`loop`、`muted`、`controls`、`autoplay`、`novalidate`、`default`、`defer`、`ismap`、`reversed`。

:::note
値は**ちょうど 1 つの** `{expr}` でなければなりません。`checked="a {b}"` のような書き方は真偽値属性では意味をなしません。
:::

## ファイルの URL は `/` で始める {#file-urls-start-with}

`public/` 内のファイルを指す `src`、`href`、CSS の `url()` は `/` で始める必要があります。`assets/logo.svg` ではなく `/assets/logo.svg` と書いてください。そうしないと本番環境で壊れます。[静的アセット](/docs/static-assets)を参照してください。
