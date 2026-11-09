---
title: プリレンダリングと SEO
group: ビルドと SEO
order: 240
source: c22cfc43c2a1
---

Olum のアプリはブラウザで動きます。ユーザーにとってはそれで良いのですが、`dist/blog/hello/index.html` を読む検索エンジンやリンクプレビューには、空のシェルしか見えません。

**プリレンダリング**がそれを解決します。ビルド中に、Olum はアプリの各ページを本物のブラウザで開き、完成した HTML をそのページ専用のファイルとして保存します：

```text
npm run build
      ↓
compile + bundle
      ↓
collect every route
      ↓
open YOUR app in a real browser, once per route
      ↓
save the rendered HTML as that route's index.html
      ↓
deploy dist/ to any static host
```

速い初回描画、動くディープリンク、そしてクローラーが読めるページが手に入ります。ブラウザでページが読み込まれれば、また普通の Olum アプリに戻ります。

## 有効にする {#turn-it-on}

**`src/sitemap.js`** を作成します。このファイルがオン/オフのスイッチです。これがなければ、ビルドはプリレンダリングしません。

```js title="src/sitemap.js"
import { getPosts } from "./api.js";

export default async function () {
  const posts = await getPosts();
  return posts.map((post) => `/blog/${post.slug}`);
}
```

- **URL の配列**を返す**関数**をエクスポートします。`async` にもできます。
- 普通のコードです：インポート、`fetch`、データベースクライアントなど、Node で動くものなら何でも使えます。
- 列挙するのは**動的ルートの実際の URL**だけです（`blog/[slug]` に対する `/blog/hello` など）。通常のルートは `page.html` ファイルから自動的に見つかります。

:::tip
`src/sitemap.js` はルートではなく、ブラウザに送られることもありません。ビルド中にだけ実行されます。
:::

## プリレンダリングされるページ {#which-pages-get-prerendered}

通常のルート**と**、`sitemap.js` が返すものです（重複は除かれます）：

```text
from your folders           from sitemap.js
  /                           /blog/hello
  /about                      /blog/world
  /blog                       /match/liverpool
  /blog/:slug        ✗ dropped (a pattern, not a URL)
  /match/:slug       ✗ dropped
        └────────────┬────────────┘
                     ▼
  /  /about  /blog  /blog/hello  /blog/world  /match/liverpool
```

`sitemap.js` の URL のうち、どのルートでも表示できないものはスキップされます。

## 出力 {#the-output}

各ルートは、**独自の `index.html` を持つフォルダ**になります：

```text title="dist/"
dist/
├── index.html                  ← "/"
├── sitemap.xml
├── about/
│   └── index.html              ← "/about"
├── blog/
│   ├── index.html              ← "/blog"
│   ├── hello/index.html        ← "/blog/hello"
│   └── world/index.html
├── match/
│   └── liverpool/index.html
└── assets/
    └── …
```

親フォルダにファイルができるのは、それ自体がルートである場合だけです。`/match` を定義するものがなければ、`dist/match/index.html` はできません。

各ファイルには、[ページの `<head>`](/docs/metadata) を含むページ全体が入っています：

```html title="dist/blog/hello/index.html"
<!doctype html>
<html lang="en" data-olum>
  <head>
    <title>Hello — My Blog</title>
    <meta name="description" content="…" />
    …
  </head>
  <body>
    <div id="olum-app"><div data-olum="…"><article><h1>Hello</h1>…</article></div></div>
    <script type="module" src="/assets/index-<hash>.js"></script>
  </body>
</html>
```

ビルドは、何を書き出したか、各ページの大きさがどれくらいかを出力します：

```text
SSG: 6 route(s) to prerender
 ✓ 1/6  /about
 ✓ 2/6  /blog
 …
SSG: prerendered 6 page(s)
SSG: sitemap.xml lists 6 URL(s)

/
├── about                   1.4 kB
├── blog                    1.1 kB
│   ├── hello               2.3 kB
│   └── world               2.1 kB
└── match
    └── liverpool           1.8 kB
```

## サーバーのリライトは不要 {#no-server-rewrite-needed}

プリレンダリングしない場合、ホスティングは `/blog/hello` に対して `/index.html` を返す必要があります（[ビルドとデプロイ](/docs/build-and-deploy#deploying)を参照）。プリレンダリングすると `/blog/hello` は**本物のファイル**になるので、**設定なしで**どの静的ホスティングでも動きます。

:::tip
プリレンダリング**されない**ルートがある場合（たとえば `sitemap.js` に含めなかった `/blog/:slug`）は、それでも fallback を残しておきましょう。プリレンダリングされたルートは自分のファイルを読み込み、それ以外はシェルにフォールバックします。
:::

## データを読み込むページ {#pages-that-load-data}

`onMount` でデータを取得するページは、**最初は空**です：

```html title="src/match/[slug]/page.html"
<head>
  <title>{slug} vs {state.post?.opponent}</title>
</head>

<script>
  import { params, onMount } from "olum";
  import { getMatch } from "../../api.js";

  const { slug } = params();
  const state = { post: null };

  onMount(async () => {
    state.post = await getMatch(slug);
  });
</script>

<h1>{slug} vs {state.post?.opponent}</h1>
```

ビルドは画面に何かが表示された時点でページを保存しますが、それは `await` が終わる**前**です。待たなければ、読み込み中の状態を公開してしまいます。`SSG_DELAY`（デフォルト `500` ミリ秒）は、各ページに完了するための時間を与えます：

```json title="package.json"
{
  "olum": { "SSG_DELAY": 500 }
}
```

```html title="dist/match/liverpool/index.html"
<title>liverpool vs barcelona</title>
…
<h1>liverpool vs barcelona</h1>
```

`<head>` もページと一緒に更新されるので、ファイルには内容とメタデータの両方が入ります。

### 値の選び方 {#picking-a-value}

200〜500 ミリ秒から始めましょう。ビルドがそのコストを教えてくれます：

```text
SSG: waiting 500ms after each route (+46.5s to this build)
```

それから**ファイルを確認してください**。短すぎる遅延は何も言わずに失敗するからです：

```bash
grep -o "<title[^>]*>[^<]*</title>" dist/match/liverpool/index.html
```

まだ読み込み中の状態が表示されていますか？値を上げましょう。ビルドが遅すぎますか？値を下げて、もう一度確認しましょう。

:::warn
- **短すぎる場合：** ビルドは作りかけのページを書き出し、それでも ✓ を出力します。検索からの流入が減るまで誰も気づきません。
- **長すぎる場合：** すべてのルートでそのコストを払います（500 ミリ秒 × 93 ルート = ビルドごとに 46 秒）。
- これは固定の待ち時間であって、チェックではありません。遅い API や混雑した CI マシンでは、手元のノート PC ではうまくいく値でも間に合わないことがあります。できれば、プリレンダリングするページが必要とするデータは速く、ローカルに置いておきましょう。
:::

## sitemap.xml {#sitemapxml}

保存されたすべてのルートは、今日の日付を `<lastmod>` として `dist/sitemap.xml` に列挙されます。レンダリングに失敗したルートは除外されます（壊れたリンクは検索順位を下げてしまいます）。

検索エンジンは sitemap に完全な URL を必要とするので、`SITE_URL` でビルドにドメインを教えてください。これがないと、ビルドは警告を出し、相対パスを書き出します。

## ビルド設定 {#build-settings}

すべて `package.json` の `olum` キーの下に書きます。必須のものはなく、足りないものはビルドが教えてくれます。

```json title="package.json"
{
  "olum": {
    "SITE_URL": "https://example.com",
    "SSG_DELAY": 500,
    "base": "/"
  }
}
```

### `SITE_URL` {#site_url}

あなたのドメインで、`sitemap.xml` 内のすべての URL の前に付けられます。検索エンジンはそこにある相対 URL を無視しますし、ビルドがドメインを推測することもできません。

| 設定値 | 結果 |
|--------|--------|
| `"https://example.com"` | `<loc>https://example.com/blog/hello</loc>` |
| 未設定 | 警告と、クローラーが無視する相対的な `<loc>` の値 |

末尾のスラッシュは自動で取り除かれます。

### `SSG_DELAY` {#ssg_delay}

ページが表示されてから保存するまでの追加の待ち時間で、単位は**ルートあたりのミリ秒**です。[データを読み込む](#pages-that-load-data)ページに役立ちます。

| 設定値 | 結果 |
|--------|--------|
| 未設定 | 500 ミリ秒（**デフォルト**） |
| `0` | 待たない |
| `250` | 各ルートで 250 ミリ秒待つ |
| 数値ではない（`true`、`"soon"`、`-1`） | エラーメッセージが出て、500 が使われる（ビルドは失敗しない） |

すべてのページがすでにデータを持っているなら `0` にしましょう。そうでなければ、その待ち時間はすべてのルートで無駄なビルド時間になるだけです。

### `base` {#base}

サイトの置き場所で、デフォルトは `/` です。[Base URL](/docs/build-and-deploy#base-url) を参照してください。

:::warn
プリレンダリングは `"/"` か、`"/app/"` のようなサブフォルダでしか動きません。相対的な base（`"./"`）では壊れます。各ページはそれぞれのフォルダにあるので、`./assets/…` は `/blog/hello/assets/…` から探され、失敗します。
:::

## ブラウザでは {#in-the-browser}

クローラー、リンクプレビュー、初回描画が見るのはプリレンダリングされた HTML です。アプリが起動すると、いつもどおり `#olum-app` にレンダリングして、そこから先を引き継ぎます。

:::note
プリレンダリングされた HTML は、再利用（「ハイドレーション」）されるのではなく**置き換えられます**。動作中のアプリに引き継ぐ必要のあるものは、保存された HTML ではなく `state` に置いてください。
:::

## プレビュー {#preview}

```bash
npm start
```

`src/sitemap.js` がある場合、`/blog/hello` は `dist/blog/hello/index.html` を配信するので、プリレンダリングされたページが見えます。ない場合は、本番のホスティングと同じく、すべてのルートでルートの `index.html` が配信されます。

## 最初のビルドは遅い {#the-first-build-is-slower}

プリレンダリングにはブラウザが必要です：

- **vite** は最初のビルド（どのビルドでも）でインストールされます。
- **puppeteer** はプリレンダリングを行う最初のビルドでインストールされ、Chrome（約 150 MB）を一度だけダウンロードします。

`sitemap.js` がなければ、puppeteer はダウンロードされません。

## 知っておくと良いこと {#good-to-know}

- **失敗したページは報告されますが、致命的ではありません。** ビルドは `✗ /blog/hello — failed to render …` を出力して続行します。そのルートはプレーンなシェルのままで、`sitemap.xml` からは除外されます。
- ルーターが `#olum-app` に何かを入れた時点で（最大 15 秒）、**ページは準備完了とみなされます**。これは `onMount` の fetch が終わる前なので、`SSG_DELAY` が必要になります。
- **読み込み時に行われた処理だけが記録されます。** クリックで読み込むデータ、遅延より長いタイマー、スクロールのオブザーバーはファイルには入りません。たいていはそれで問題ありません。
- **`/` は意図的に最後に保存されます**：ローカルのプレビューサーバーは不明な URL に対して `dist/index.html` を使うので、他のルートが終わるまで空のシェルのままにしておく必要があります。
- **コンパイルエラーはビルド全体を失敗させる**ので、CI がデプロイ前に検出できます。

## 関連項目 {#see-also}

- [ページのメタデータと SEO](/docs/metadata)：各ページがファイルに書き込む `<head>`。
- [ビルドとデプロイ](/docs/build-and-deploy)：ビルドの出力とホスティングの設定。
- [ファイル規約](/docs/router/file-conventions)：フォルダがどのようにルートになるか。
