---
title: 環境変数
group: ビルドと SEO
order: 225
source: 1efeaafd7814
---

API のアドレスのように、手元のパソコンと公開サイトで変わる設定は `.env` ファイルに書き、コードでは `process.env.NAME` として読みます。

```text title=".env.development"
API_URL="http://localhost:3000"
```

```text title=".env.production"
API_URL="https://api.example.com"
```

```html title="src/page.html"
<script>
  import { onMount } from "olum";
  const state = { posts: [] };

  onMount(async () => {
    const res = await fetch(process.env.API_URL + "/posts");
    state.posts = await res.json();
  });
</script>
```

`npm run dev` は `http://localhost:3000` に、ビルドしたサイトは `https://api.example.com` にアクセスします。コードの変更は不要です。

## どのファイルが使われるか {#which-file-is-used}

ファイルはプロジェクトのルート、`package.json` の隣に置きます：

| コマンド | 読み込むファイル |
|---------|-------|
| `npm run dev` | `.env`、次に `.env.development` |
| `npm run build` | `.env`、次に `.env.production` |

- `.env` は任意で、両方に共通の値を書きます。同じ名前が両方のファイルにある場合は、後のファイルが優先されます。
- `.env` だけがある場合は、dev **と**ビルドの両方で使われます。
- ファイルが1つもない → `process.env` は空のオブジェクトです。

## ファイルの書き方 {#file-format}

```text title=".env"
# a line starting with # is a comment
API_URL=https://api.example.com
export SITE_NAME="My Shop"    # quotes and `export` are optional
GREETING="Hello\nWorld"       # \n is a new line, inside double quotes only
```

**値はすべて文字列です。** 自分で変換してください：

```js
if (process.env.DEBUG) {}                        // ✗  DEBUG=false is the string "false", which is truthy
if (process.env.DEBUG === "true") {}             // ✓
const pageSize = Number(process.env.PAGE_SIZE);  // ✓  "20" → 20
```

名前には英字・数字・`_` を使ってください（`API_URL`、`apiUrl`）。

## ここに書いたものはすべて公開されます {#everything-here-is-public}

:::danger[秘密の値は絶対に書かないでください]
これらの値は**ビルドに含まれます**。バンドルされた JS に書き込まれ、訪問者のブラウザがダウンロードするので、誰でも読めます。アドレスや機能のオン/オフは問題ありません。**重要な認証情報**（秘密の API キー、データベースのパスワード、非公開トークン）は**別のバックエンド**に置く必要があります。アプリはそのバックエンドを呼び出し、秘密の値を使うのはバックエンドだけです。
:::

## 仕組み {#how-it-works}

- **dev では**、値は `process.env` を設定する小さな生成モジュールに書き込まれます。`main.js` が最初にそれをインポートするので、あなたのコードより先に実行されます。`public/index.html` のインラインスクリプトはそれより前に実行されるため、読めません。
- **ビルドでは**、省略せずに書いた `process.env.NAME` がバンドルされた JS の中でその値に置き換えられます。決して成り立たない条件の後ろにあるコード（`DEBUG=false` のときの `if (process.env.DEBUG === "true")`）はバンドルから取り除かれます。
- ビルドでは、`process.env[name]` やファイルにない名前は `undefined` になります。名前は省略せずに書いてください。

## 知っておくと良いこと {#good-to-know}

- **`.env` ファイルを編集したら `npm run dev` を再起動してください。** 開発サーバーは起動時に読み込みます。
- `process.env.NODE_ENV` はあなたの値ではありません。ビルドでは `"production"` になり、dev では `.env.development` に書かない限り `undefined` です。
- `public/index.html` で `process` を自分で作らないでください（`const process = { env: {} }`）。Olum が追加した値が隠れてしまい、dev で `process.env` が空になります。
