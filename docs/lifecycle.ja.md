---
title: ライフサイクルフック
group: コンポーネント
order: 180
source: 820ee91bfc75
---

`onMount` は、コンポーネントが**ページに表示されたとき**にコードを実行します。関数を返すと、その関数はコンポーネントが**削除されたとき**に実行されます（「クリーンアップ」）。

```html title="Component.html"
<script>
  import { onMount } from "olum";

  onMount(() => {
    console.log("mounted");
    return () => {
      console.log("removed");
    };
  });
</script>
```

クリーンアップは、コンポーネントが削除されたとき（`<if>` が false になった、key 付きリストの項目が削除された、ルートが変わった）と、アプリ全体が [`app.destroy()`](/docs/embedding) で終了したとき（埋め込みはメンテナンス中です）に実行されます。

:::warn
`onMount` はコンポーネントごとに **1 回だけ**呼びます。2 回目の呼び出しは無視されます。セットアップはすべて 1 つのコールバックにまとめ、クリーンアップを 1 つ返してください。
:::

## データの読み込み {#loading-data}

コールバックは `async` にできます。データを取得するのは普通ここです：

```html title="Component.html"
<script>
  import { onMount } from "olum";

  const state = { photos: [] };

  onMount(async () => {
    const res = await fetch("/api/photos");
    state.photos = await res.json();
  });
</script>
```

## タイマーとグローバルなリスナー {#timers-and-global-listeners}

タイマー、`requestAnimationFrame` のループ、`window` / `document` のリスナーは `onMount` で開始し、クリーンアップで停止します：

```html title="Component.html"
<script>
  import { onMount } from "olum";

  const state = { seconds: 0 };

  onMount(() => {
    const interval = setInterval(() => state.seconds++, 1000);
    return () => clearInterval(interval);
  });
</script>

<p>Open for {state.seconds} {state.seconds === 1 ? "second" : "seconds"}</p>
```

## `host` {#host}

`host` はこのコンポーネント自身のラッパー要素です。インポートは不要です。`document.querySelector(…)` ではなく `host.querySelector(…)` を使いましょう。前者は、同じコンポーネントの別のインスタンスやページの別の場所にある要素を見つけてしまう可能性があります。

`onMount` やイベントハンドラ（コンポーネントがページに表示された後に実行されるもの）の中では使えますが、`<script>` のトップレベルでは**使えません**。

```html title="Box.html"
<script>
  import { onMount } from "olum";

  const state = { w: 0, h: 0 };

  onMount(() => {
    const box = host.querySelector(".box");
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      state.w = Math.round(rect.width);
      state.h = Math.round(rect.height);
    });
    observer.observe(box);

    return () => observer.disconnect();
  });
</script>

<p>measured: {state.w}px × {state.h}px</p>
<div class="box">…</div>
```

同じ開始/停止のパターンは次のものにも使えます：

- `<canvas>` の描画ループ
- `requestAnimationFrame` で追いかける `<video>`（`onplay`、`onpause`、`onloadedmetadata` は通常の属性として使えます。`onMount` が必要なのは、ループや `video.currentTime` のようなものだけです）
- `copy` や `paste` のように属性として書けないイベント（[イベント](/docs/events#events-you-must-add-by-hand)を参照）

例：[`/forms/host-element`](/forms/host-element)（canvas）、[`/forms/dimensions`](/forms/dimensions)（ResizeObserver）、[`/forms/media-elements`](/forms/media-elements)（動画プレーヤー）。
