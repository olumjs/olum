---
title: ビルドとデプロイ
group: ビルドと SEO
order: 220
source: c290ad764090
---

コマンド 1 つで本番用にサイトをビルドし、`dist/` フォルダを任意の静的ホスティングにアップロードします：

```bash
npm run build
```

コンポーネントをコンパイルし、すべてを **vite**（初回のビルド時に自動でインストールされます）でバンドルして、結果を `dist/` に書き出します：

```text title="dist/"
dist/
├── index.html                  ← entry page
└── assets/
    ├── index-<hash>.js         ← your app, minified
    ├── index-<hash>.css        ← main.css + all component styles
    ├── favicon-<hash>.svg
    └── ...                     ← every file from public/assets, plus code-split chunks
```

- **`public/` 内のものはすべて含まれます。** バンドラが認識できるファイルにはハッシュ付きの名前が付き、実行時の文字列で使われるファイル（`url(/assets/{type}.svg)` など）はそのままコピーされます。[静的アセット](/docs/static-assets)を参照してください。
- **コンパイルエラーがあるとビルドは止まります。** エラーが出力され、何も書き出されず、コマンドは失敗します（そのため CI で検出できます）。

## ビルドのプレビュー {#preview-the-build}

```bash
npm start
```

本番のホスティングと同じように `dist/` を配信するので、デプロイ前に確認できます。

## プリレンダリング（推奨） {#prerendering-recommended}

`src/sitemap.js` ファイルを追加すると、ビルドは各ルートを個別の HTML ファイル（`dist/about/index.html`、`dist/blog/hello/index.html` など）としても保存し、`sitemap.xml` も作ります。検索エンジンが読めるページ、速い初回描画、そしてサーバー設定なしで動くディープリンクが手に入ります。[プリレンダリングと SEO](/docs/prerendering)を参照してください。

## ビルド設定 {#build-settings}

ビルド設定はすべて `package.json` の `olum` キーの下に書きます。どれも省略できます：

```json title="package.json"
{
  "olum": {
    "SITE_URL": "https://example.com",
    "SSG_DELAY": 500,
    "base": "/"
  }
}
```

| 設定 | 役割 |
|---------|--------------|
| `SITE_URL` | あなたのドメイン。`sitemap.xml` で使われます。これがないと、検索エンジンは sitemap を無視します。 |
| `SSG_DELAY` | プリレンダリング時に、各ルートを保存する前に待つ時間（ミリ秒）。デフォルトは `500`。`onMount` でデータを読み込むページがなければ `0` にします。 |
| `base` | サイトの置き場所。デフォルトは `/`。[Base URL](#base-url) を参照してください。 |

最初の 2 つは[プリレンダリングと SEO](/docs/prerendering#build-settings)で説明しています。

## デプロイ {#deploying}

`dist/` はただの静的ファイルです。Netlify、Vercel、Cloudflare Pages、GitHub Pages、nginx、S3 など、どこにでもアップロードできます。

**プリレンダリングした場合**、設定は何も必要ありません。`/blog/hello` は `index.html` を持つ本物のフォルダなので、どのホスティングでも配信されます。

**プリレンダリングしていない場合**、設定が 1 つ必要です：

:::warn
ルーターはきれいな URL（**history モード**）を使うので、ホスティングは実在するファイルではないすべてのパスに対して `index.html` を返す必要があります。そうしないと、`/blog/hello` のようなページをリロードしたときに 404 になります。ホスティングでは通常、これを「SPA fallback」や「rewrite all to /index.html」と呼んでいます。
:::

```text title="Netlify — public/_redirects"
/*  /index.html  200
```

```json title="Vercel — vercel.json"
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

ルーターはリライトがないことを検出できません。ハッシュ URL（`/#/blog/hello`）に切り替わるのは、ブラウザに History API がない場合だけです。

:::tip
プリレンダリングしていても fallback を残しておいて害はありません。また、*一部の*ルートだけをプリレンダリングしている場合に役立ちます。プリレンダリングしたルートは自分のファイルを読み込み、それ以外はシェルにフォールバックします。
:::

## Base URL {#base-url}

デフォルトでは、`dist/` 内のすべてのリンクはサイトのルートから始まります：`/assets/index-abc123.js`。サイトがドメインのルートにあるならそれで正しいです。そうでない場合は `base` を設定します：

```json title="package.json"
{
  "olum": { "base": "./" }
}
```

| `base` | リンクはこうなる | 用途 |
|--------|--------------|------------|
| 未設定または `"/"` | `/assets/index-abc123.js` | ドメインのルートにあるサイト（**デフォルト**） |
| `"./"` | `./assets/index-abc123.js` | ディスクから `dist/index.html` を開く（`file://`）デスクトップアプリ（nw.js、Electron） |
| `"/app/"` | `/app/assets/index-abc123.js` | サブフォルダにあるサイト。たとえば GitHub Pages のプロジェクトサイト |
| `"https://cdn.example.com/"` | `https://cdn.example.com/assets/index-abc123.js` | アセットは CDN に、`index.html` は自分のホスティングに置く場合 |

- スラッシュは自動で補正されます：`"app"`、`"/app"`、`"/app/"` は同じです。`.` で始まるものはすべて `"./"` になります。
- スペース、引用符、`<` `>` を含む値はエラーで拒否され、ビルドは `/` を使います。
- `BASE`（大文字）でも動きます。
- base が `/` でない場合、ビルドは最初に `building with base "./"` を出力します。
- これを使うのは**ビルド**だけです。`npm run dev` は常に `/` から配信します。

### 書き換えられるもの {#what-gets-rewritten}

Vite は認識できる URL（`public/index.html` 内のタグ、インポートしたアセット）を修正します。ビルドはさらに、テンプレート内の `src`、`href`、`poster` が `public/` の実在するファイルを指している場合、それも修正します：

```html
<img src="/assets/logo.svg" />   <!-- with base "./" the bundle says ./assets/logo.svg -->
```

次の 2 つは書き換え**られません**：

- **コンポーネントの `<style>` 内の `url(...)`** と、**実行時に組み立てるパス**（`url(/assets/{type}.svg)`）。これらは `/...` のまま残るので、そうした画像にはテンプレートの `src` 属性を使ってください。
- **ルーターのリンク（`to="/about"`）**：これらはファイルではなくルートです。ルーターの `root`（下記）を使ってください。

:::warn
[プリレンダリング](/docs/prerendering)と一緒に `"./"` を使わないでください。プリレンダリングされた各ページはそれぞれのフォルダにあるので、`./assets/…` は `/blog/hello/assets/…` から探され、失敗します。`/` か、`/app/` のようなサブフォルダを使ってください。
:::

### サブフォルダではルーターの設定も必要 {#a-sub-folder-needs-the-router-too}

`base` が動かすのは**ファイル**であって、**ルート**ではありません。`/app/` の下では、ブラウザは `/app/about` にいますが、ルートは `/about` なので、自動生成されたルーターは 404 ページを表示します。独自の `src/main.js` を書き、ルーターに同じ `root` を指定してください：

```js title="src/main.js"
import Olum from "olum";
import Router from "olum-router";

import Home from "./page.js";
import About from "./about/page.js";

const routes = [
  { path: "/", comp: Home },
  { path: "/about", comp: About }
];

const router = new Router({ mode: "history", root: "/app", routes: routes });
new Olum().$("#olum-app").use(router);
```

`src/main.js` を作ると、ルートはフォルダから自動生成されなくなります。一覧は自分で管理することになります。[ルーター](/docs/router/router#opting-out--your-own-mainjs)を参照してください。
