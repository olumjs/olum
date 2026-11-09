---
title: ページのメタデータと SEO
group: ビルドと SEO
order: 230
source: 99b6016ebaac
---

ページは、その `page.html` の中で自分の `<head>`（タイトル、説明、ソーシャルカード、canonical リンク、JSON-LD）を設定できます：

```html title="src/blog/[slug]/page.html"
<head>
  <title>{post.title} — My Blog</title>
  <meta name="description" content="{post.excerpt}" />
  <link rel="canonical" href="https://example.com/blog/{slug}" />

  <meta property="og:title" content="{post.title}" />
  <meta property="og:image" content="{post.cover}" />
  <meta name="twitter:card" content="summary_large_image" />
</head>

<script>
  import { params } from "olum";
  import { getPost } from "../../api.js";

  const { slug } = params();
  const post = getPost(slug);
</script>

<article>
  <h1>{post.title}</h1>
  {post.body}
</article>
```

`<head>` 内の `{expr}` では、テンプレートと同じく `<script>` にあるもの（`state`、`params()`、`props()`、あなたの定数）を何でも使えます。

## `<head>` を持てるのはページだけ {#only-pages-can-have-a-head}

| ファイル | `<head>` は使える？ |
|------|-------------------|
| `page.html` | ✅ はい |
| `not-found.html` | ✅ はい |
| それ以外のコンポーネント | ❌ 無視され、移動先を示すビルド警告が出る |

:::warn
- タグは閉じてください：`<head> … </head>`。閉じていない `<head>` は無視されます（警告が出ます）。
- ファイル内で使われるのは**最初の** `<head>` だけです。
:::

## `public/index.html` との組み合わせ方 {#how-it-combines-with-publicindexhtml}

`public/index.html` が出発点です。ページのタグはそこにマージされます：

- ページに**同じ種類**のタグがあれば、元のタグを同じ位置で**置き換えます**。
- なければ、ページのタグは末尾に**追加されます**。
- それ以外のものは、Olum の `<style>` タグやバンドラの `<script>` / `<link>` タグも含めて、すべてそのまま残ります。

「同じ種類」とみなされるもの：

| タグ | 次が同じなら同じ種類… |
|-----|------------------------|
| `<title>`、`<base>` | （ページに 1 つだけ） |
| `<meta charset>` | `charset` |
| `<meta name>`、`<meta property>`、`<meta http-equiv>`、`<meta itemprop>` | name / property |
| `<link rel="canonical" \| "icon" \| "apple-touch-icon" \| "manifest" \| "amphtml">` | `rel`（ページに 1 つだけ） |
| `<link rel="stylesheet" \| "preload" \| "preconnect" \| …>` | `rel` **と** `href`。そのためページはスタイルシートを置き換えるのではなく**追加**します |
| `<script type="application/ld+json">` | ページに 1 つ（複数必要なら、それぞれに `id` を付ける） |

**例。** シェルには `<title>`、`charset`、`description`、`viewport` とスタイルシートがあります。ページでは `<title>`、`description`、`og:title` を宣言しています。結果：タイトルと説明は**置き換えられ**、`og:title` は**追加され**、`charset`、`viewport`、スタイルシートは**そのまま**です。

`not-found.html` も同じように動くので、404 ページでも独自の `<title>` や `robots` を設定できます。

:::tip
サイト全体で使うタグ（`charset`、`viewport`、ファビコン、スタイルシート、`theme-color`）は `public/index.html` に置きます。ページの `<head>` には、そのページ固有のタグだけを置きます。
:::

### ページを移動しても常にクリーン {#changing-pages-is-always-clean}

ルートが読み込まれるたびに、Olum は**まず head を `public/index.html` の状態に戻し**、それから新しいページのタグを適用します。そのため、前のページの `og:image` が次のページに漏れることはありません。`<head>` のないページは、元の head とまったく同じになります。

:::note
置き換えられたタグは非表示の `<template data-olum-head>` に保存され（[プリレンダリング](/docs/prerendering)されたページはこれを使ってタグを復元します）、ページが追加したタグには `data-olum-head` 属性が付きます。どちらも害はないので、無視してください。
:::

## 構造化データ（JSON-LD） {#structured-data-json-ld}

`<script type="application/ld+json">` の中では、普通の `{` は通常の JSON です。`{expr}` は**ダブルクォートの文字列の中**でしか使えず、JSON が正しく保たれるよう、値は**そのまま**（HTML エスケープされずに）挿入されます：

```html title="src/match/[slug]/page.html"
<head>
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "SportsEvent",
      "name": "{match.name}",
      "url": "https://example.com/match/{slug}",
      "startDate": "{match.kickoff}"
    }
  </script>
</head>
```

:::warn
値がそのまま挿入されるため、値に `"` や `\` が含まれていると JSON が壊れます。ユーザーが入力したテキストには、周りの引用符を**付けずに** `{JSON.stringify(match.name)}` を使ってください。
:::

## それ以外の場所でのエスケープ {#escaping-everywhere-else}

JSON-LD の外では、テンプレートと同じく `{expr}` は **HTML エスケープ**されるので、説明文の中の引用符でタグが壊れることはありません。

| 書いたもの | 得られるもの |
|-----------|---------|
| `` ` `` | バッククォート（自動でエスケープされます） |
| `\` | バックスラッシュ（自動でエスケープされます） |
| `${x}` | `$` の後に `{x}` の値（`$` はただのテキスト） |

## ステートに合わせて更新される {#it-updates-with-your-state}

head はページと一緒に再レンダリングされます。開発中**も**本番環境でもです：

```html title="src/blog/[slug]/page.html"
<head>
  <title>{state.post.title} — My Blog</title>
</head>

<script>
  import { onMount } from "olum";
  const state = { post: { title: "Loading…" } };

  onMount(async () => {
    state.post = await fetchPost();   // the tab title updates
  });
</script>
```

head を制御するのは**ページ**だけです。子コンポーネントが head に触れることはなく、head は出力が実際に変わったときにだけ再適用されます。

:::warn
ソーシャルのプレビュー（Twitter、Slack、Facebook、LinkedIn）は JavaScript を実行せず、HTML ファイルを読むだけです。それらにタグを見てもらうには、ページを[プリレンダリング](/docs/prerendering)する必要があります。タイトルが `await` から得られる場合は、ビルドもそれを待つ必要があります。そのためにあるのが `SSG_DELAY` です。
:::

## どこで適用されるか {#where-it-applies}

- **`npm run dev`**：ルートの読み込み時と、再レンダリングのたびに適用されます。
- **プリレンダリングありの `npm run build`**：各ルートの `index.html` に書き込まれるので、クローラーは JavaScript なしで読めます。
- **プリレンダリングなしの `npm run build`**：ブラウザでのみ適用されます。JavaScript を実行しないツールには `public/index.html` の head が見えます。
