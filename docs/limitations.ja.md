---
title: 制限事項
group: 応用
order: 270
source: 63fd71405920
---

Olum は意図的に小さく作られているので、いくつかの機能はありません。どれにも簡単な回避策があります。

## 1. `key` のないリストは位置で行を対応させる {#1-lists-without-key-match-rows-by-position}

key のない `<for>` リストを並び替えると、各行が隣の項目のデータで描き直されるため、チェックされたボックスなどが間違った行に飛んだように見えます。[`key`](/docs/loops#keys-add-one-when-items-can-move) を付ければ、行そのものが移動します。[レンダリングと更新](/docs/rendering#keys-which-element-is-which)を参照してください。

## 2. 要素の ref やアクションはない {#2-no-element-refs-or-actions}

`bind:this` も `use:action` もありません。[`onMount`](/docs/lifecycle) の中で自分で行い、`host` で要素を見つけ、クリーンアップを返します：

```html title="Component.html"
<script>
  import { onMount } from "olum";
  import { longpress } from "./longpress.js";

  onMount(() => {
    const button = host.querySelector("button");   // the "ref"
    const action = longpress(button, 2000);        // the "action"
    return () => action.destroy();                 // cleanup when removed
  });
</script>

<button>press and hold</button>
```

`onMount` は更新のたびではなく 1 回だけ実行されます。それで問題ありません。更新は[要素をその場で変更する](/docs/rendering)ので、ボタンは同じ要素のままで、動き続けます。動作がステートに依存する場合は、ハンドラの中でステートを読んでください。

（アニメーションは組み込まれて**います**。[トランジション](/docs/transition/transitions)を参照してください。）

## 3. `<window>` / `<document>` / `<body>` 要素はない {#3-no-window--document--body-elements}

グローバルなイベントを受け取るには、`onMount` でリスナーを追加し、クリーンアップで削除します：

```html title="Component.html"
<script>
  import { onMount } from "olum";

  const state = { keys: [] };
  const handleKeydown = (e) => (state.keys = [...state.keys, e.key].slice(-8));

  onMount(() => {
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  });
</script>
```

`selectionchange` のような `document` のイベントも同じです。

## 4. 動的なコンポーネントタグはない {#4-no-dynamic-component-tag}

`<component is="…">` はありません。ステートの値と `<if>` / `<else-if>` を使います：

```html title="Component.html"
<script>
  import RedThing from "./RedThing";
  import GreenThing from "./GreenThing";
  import BlueThing from "./BlueThing";

  const state = { color: "red" };
</script>

<if when="state.color === 'red'"><RedThing /></if>
<else-if when="state.color === 'green'"><GreenThing /></else-if>
<else><BlueThing /></else>
```

## 5. 関数の prop は名前でなければならない {#5-function-props-must-be-a-name}

自作のコンポーネントでは、関数の prop は単純な**名前**（親の `<script>` にある関数、または `props()` から取り出した関数）のときにしか動きません。インラインのアロー関数、`obj.fn`、関数呼び出しは関数として渡りません：

```html title="Parent.html"
<!-- <Input/> = YOUR component, not the HTML <input/> -->
<Input oninput="{handleInput}" />              <!-- ✓ -->
<Input oninput="(e) => state.text = e" />      <!-- ✗ arrives as text -->
<Input oninput="{(e) => state.text = e}" />    <!-- ✗ arrives as undefined -->
```

通常の HTML タグには影響しません。そちらでは `on*` にインラインのコードを書いて問題ありません（[イベント](/docs/events)）。追加のデータを渡すには、それを別の prop として送り、子から返してもらいます（[コンポーネントと Props](/docs/components#function-props)）。
