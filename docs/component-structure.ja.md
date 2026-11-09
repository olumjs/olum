---
title: コンポーネントファイルの構成
group: はじめに
order: 10
source: 59f27b670f3a
---

コンポーネントは 1 つの `.html` ファイルです。3 つの部分を持てます：

- `<script>`：JavaScript（データと関数）
- `<style>`：CSS（このコンポーネントにだけ効きます）
- それ以外のすべて：HTML テンプレート

```html title="Counter.html"
<script>
  const state = { count: 0 };
  const inc = () => state.count++;
</script>

<style>
  .counter { font-weight: 700; }
</style>

<div class="counter">
  Count: {state.count}
  <button onclick="inc()">+</button>
</div>
```

テンプレートでは `<script>` で宣言したものをすべて使えます：`state`、あなたの関数、そして [`props()`](/docs/components) から取り出した名前です。

## 知っておくと良いこと {#good-to-know}

- **ファイル名がコンポーネント名になります。** `CounterCard.html` は `CounterCard` コンポーネントになります。PascalCase（各単語の先頭を大文字にする）を使ってください。
- **コンポーネントのタグも PascalCase です**：`<CounterCard />`。この大文字によって、Olum はあなたのコンポーネントと `<div>` のような通常の HTML タグを見分けます。
- **`<script>` と `<style>` は省略できます。** HTML だけのファイルも正しいコンポーネントです。
- **`<style>` は自動的にスコープ化されます。** [スコープ付き CSS](/docs/scoped-css)を参照してください。
- **各コンポーネントは Olum が追加する `<div>` で包まれます。** この `<div>` が [`host`](/docs/lifecycle) 要素です。コンポーネントの周りに `.parent > .child` のような CSS を書くときは、このことを覚えておいてください。
- **ページファイルには `<head>` も書けます。** ページのタイトル、説明、その他の meta タグを設定できるのはルートファイル（`page.html` と `not-found.html`）だけです。それ以外のコンポーネントでは `<head>` は無視され、ビルド時に警告が出ます。[ページのメタデータと SEO](/docs/metadata)を参照してください。

```html title="src/blog/[slug]/page.html"
<head>
  <title>{post.title} — My Blog</title>
  <meta name="description" content="{post.excerpt}" />
</head>

<script>
  import { params } from "olum";
  const { slug } = params();
  const post = getPost(slug);
</script>

<article><h1>{post.title}</h1></article>
```
