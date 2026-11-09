---
title: スコープ付き CSS
group: コンポーネント
order: 190
source: 57a6aaecd0a7
---

コンポーネントの `<style>` に書いた CSS は、**そのコンポーネントだけ**に効きます。普通の CSS を書くだけです：

```html title="Component.html"
<style>
  .title { color: #4f46e5; }   /* won't affect other components */
</style>
<h1 class="title">Hello</h1>
```

**仕組み：** Olum はコンポーネントの要素に固有の属性を付け、それを各セレクタに追加します（`p:hover` は `p[data-o-x]:hover` になります）。子コンポーネントは別の属性を持つので、`.card p` でさえネストしたコンポーネント内の `<p>` にはスタイルが当たりません。

## グローバルスタイル {#global-styles}

`:root`、`html`、`body` で始まるセレクタはスコープ化**されません**。コンポーネントでグローバルな CSS が必要なときに使います：

```html title="Component.html"
<style>
  :root { --brand: #25c97e; }        /* a global CSS variable */
  body { overflow: hidden; }          /* global while this style is on the page */
  .panel { color: var(--brand); }     /* scoped as usual */
</style>
```

どのコンポーネントにも属さないアプリ全体のスタイルには `public/main.css` を使います。

## 知っておくと良いこと {#good-to-know}

- **`@keyframes` はコンポーネントごとです。** `@keyframes fade` は `fade-<ComponentName>` に名前が変わり（`animation` / `animation-name` もそれに合わせて更新されます）、2 つのコンポーネントがそれぞれ `fade` を持っても衝突しません。
- **`@media`、`@supports`、`@layer`、`@container`**：中のルールは通常どおりスコープ化されます。
- **`@font-face`** はそのまま残ります。
- **CSS のコメント**は削除されます。
- スタイルは**コンポーネントごとに 1 回だけ**、最初に表示されたときに `<head>` へ `<style id="olum-style-<Name>">` として追加されます。そのコンポーネントのすべてのインスタンスで共有されます。
- `url(...)` は `/` で始める必要があります（`url(/assets/x.svg)`）。そうしないとネストしたページで壊れます。[静的アセット](/docs/static-assets)を参照してください。
- コンポーネントのラッパー `<div>` 用の `:host` セレクタはありません。自分の要素に直接スタイルを当ててください。
