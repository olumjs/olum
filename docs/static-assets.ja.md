---
title: 静的アセット
group: はじめに
order: 20
source: 2c152bc5a54e
---

画像、アイコン、フォント、ダウンロード用ファイルは `public/` フォルダに置きます。中身はすべて**サイトのルート**から配信されます：`public/assets/logo.svg` は `/assets/logo.svg` でアクセスできます。

## URL は必ず `/` で始める {#always-start-the-url-with}

```html title="Component.html"
<!-- ✓ works on every page, in dev and in production -->
<img src="/assets/logo.svg" />

<style>
  .icon { background: url(/assets/folder.svg) no-repeat; }
</style>

<!-- ✗ breaks in production -->
<img src="assets/logo.svg" />
```

**理由：** Olum は実行中にテンプレートとスタイルをページに追加するため、ブラウザは相対 URL を現在のページを基準に解決します。`/shop/cart` では、`assets/logo.svg` は存在しない `/shop/assets/logo.svg` になってしまいます。

:::warn
開発サーバーはこの間違いを隠してしまいます。ファイルが見つかるまで短いパスを順に試すので、開発中は相対 URL でも*動いているように見えます*。本番のホスティングはそうしてくれません。必ず `/assets/...` と書いてください。
:::

## 動的なパス {#dynamic-paths}

URL はただの文字列なので、中で `{expr}` を使えます。先頭の `/` は残してください：

```html title="File.html"
<span style="background-image: url(/assets/{type}.svg)">{name}</span>
```

[ビルド](/docs/build-and-deploy)は `public/` 内のすべてのファイルを出力先にコピーするので、このように使うファイルも必ず存在します。

## サイトがドメインのルートにない場合 {#site-not-at-the-domain-root}

それでも `/assets/...` と書きます。[`base`](/docs/build-and-deploy#base-url) を `/` 以外（サブフォルダ、CDN、`file://` のデスクトップアプリ）に設定した場合、`public/` 内の実在するファイルを指す `src`、`href`、`poster` の値はビルドが自動で修正します。

:::warn
次の 2 つは修正**されず**、`/...` のまま残ります：コンポーネントの `<style>` 内の `url(...)` と、`url(/assets/{type}.svg)` のように実行時に組み立てるパスです。カスタムの base ではこれらは見つかりません。そうした画像にはテンプレートの `src` 属性を使ってください。
:::

:::note
`public/index.html`（アプリのシェル）と `public/main.css`（グローバル CSS）はビルドで処理されます。`public/` 内のそれ以外のものはそのまま公開されるので、作業用のファイルを置きっぱなしにしないでください。
:::
