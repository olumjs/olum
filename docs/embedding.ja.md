---
title: React と Vue への埋め込み
group: 応用
order: 260
source: 391c7fa601da
---

Olum のアプリは React や Vue のアプリの中で動かせます。通常どおりマウントし、ホストのアプリがそれを取り除くときに `app.destroy()` を呼びます。

:::warn[メンテナンス中]
埋め込みはまだ開発中です。`app.destroy()` はありますが、この API とルールは変わる可能性があります。まだ本番環境では頼らないでください。
:::

```js title="main.js"
import Olum from "olum";
import App from "./App.js";

const app = new Olum();
app.$("#olum-app").use(App); // mount
app.destroy();               // unmount and clean up
```

`$()` は CSS セレクタ**または要素**を受け取るので、React や Vue の ref を直接渡せます。

## `destroy()` が行うこと {#what-destroy-does}

- すべてのコンポーネントの [`onMount`](/docs/lifecycle) のクリーンアップを実行します（子から先に）。
- Olum の `window` リスナーを削除し、保留中の更新を破棄します。
- `document.head` を Olum が変更する前の状態に戻します（[ページのメタデータ](/docs/metadata)を参照）。
- ルート要素を空にします。

2 回呼んでも安全で、`use()` の前に呼んでも何も起きません。コンポーネントの `<style>` タグは `<head>` に残ります（それぞれ 1 回しか追加されないので、後で再マウントしても CSS が使えます）。

## React {#react}

```jsx title="OlumMount.jsx"
import { useEffect, useRef } from "react";
import Olum from "olum";

export default function OlumMount({ app: App }) {
  const ref = useRef(null);

  useEffect(() => {
    const app = new Olum();
    app.$(ref.current).use(App);
    return () => app.destroy();
  }, [App]);

  return <div ref={ref} />;
}
```

開発中、React の StrictMode はマウント、破棄、再マウントを行います。問題ありません。`new Olum()` はそのたびにまっさらな状態から始まります。

## Vue {#vue}

```html title="OlumMount.vue"
<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";
import Olum from "olum";

const props = defineProps({ app: Function });
const el = ref(null);
let app;

onMounted(() => {
  app = new Olum();
  app.$(el.value).use(props.app);
});
onBeforeUnmount(() => app.destroy());
</script>

<template><div ref="el"></div></template>
```

## ルール {#rules}

:::warn
- **ページ上の Olum アプリは同時に 1 つだけ。** 新しいアプリをマウントする前に古いものを破棄してください（ルートが変わるとき、React と Vue はすでに正しい順序でこれを行います）。
- **ホストアプリの中では Olum のルーターを使わないでください。** コンポーネントを 1 つマウントし、ページの選択は React/Vue のルーターに任せます。Olum の中でビューを切り替えるには、ステートと `<if>` を使います。
- **埋め込むコンポーネントに `<head>` を書かないでください。** ホスト側の head 管理と衝突します。
- **ホストは Olum のルート要素の中に何も入れてはいけません。** その中のものはすべて Olum が管理します。
:::
