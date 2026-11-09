---
title: デバッグ
group: テンプレート構文
order: 150
source: 68f554f1ee61
---

## `<log>`：値が変わったら出力する {#log-print-a-value-when-it-changes}

テンプレートのどこにでも `<log>{expr}</log>` を置けます。コンポーネントが最初に表示されたときと、**その値が変わるたびに** `console.log(expr)` を実行します。ページには何も表示されません。（Svelte の `{@debug}` のようなものです。）

```html title="Component.html"
<script>
  const state = { user: { firstname: "Ada", lastname: "Lovelace" } };
</script>

<input value="{state.user.firstname}" oninput="(e) => state.user.firstname = e.target.value" />

<log>{state.user}</log>

<h1>Hello {state.user.firstname}!</h1>
```

ブラウザのコンソールを開いて入力欄に文字を打つと、変更のたびに `user` が出力されます。

- カンマで複数の値を出力できます：`<log>{state.a, state.b}</log>` は `console.log(state.a, state.b)` になります。
- 出力されるのは、**それが読み取っている** state のキーが変わったときだけです。`state.y` が変わっても `<log>{state.x}</log>` は何も出しません。

もっと細かく制御したい場合（特定の条件のときだけ止めるなど）は、[ウォッチャー](/docs/watchers)の中に `debugger;` や `console.log` を書きます。
