---
title: 表示 / 非表示
group: テンプレート構文
order: 90
source: b55bd0de179f
---

`<if>` に似ていますが、中身は**ページに残ったまま**で、隠されるだけです：

```html title="Component.html"
<show when="state.visible">
  <div class="panel">Always on the page; only hidden or shown.</div>
</show>
```

何も削除されないので、再生中の `<video>`、実行中のアニメーション、入力欄に打ち込んだテキストは、隠してから再表示しても残ります。

**仕組み：** `<show>` は `<div data-o-show>` のラッパーになります。表示中は `display: contents`（スペースを取らないので、子要素はラッパーがないかのように見えます）、非表示のときは `display: none` になります。

:::note
- ラッパーは常に存在するので、`.parent > .panel` のような CSS ルールはマッチしません。`[data-o-show] > .panel` を使うか、`>` を外してください。
- `<table>` や `<select>` の中には `<div>` を置けないので、テーブルの行や option の周りには `<show>` を使わないでください。そこでは代わりに [`<if>`](/docs/conditionals) か `style` 属性を使います。
:::
