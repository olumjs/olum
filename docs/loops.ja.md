---
title: ループ
group: テンプレート構文
order: 100
source: 0588db1614c1
---

`<for>` で HTML を繰り返します。`each` には JavaScript の式を書きます（`{ }` は不要です）。3 つの形があります：

```html title="Component.html"
<!-- array: "item of list" -->
<for each="fruit of state.fruits">
  <li>{fruit.name}</li>
</for>

<!-- count: "i of N" (i goes 1 → N, not from 0) -->
<for each="i of 6">
  <span>Step {i}</span>
</for>

<!-- object keys: "key in obj" -->
<for each="key in state.settings">
  <div>{key}: {state.settings[key]}</div>
</for>
```

## インデックスを取得する {#getting-the-index}

括弧を使うと、`Array.map` と同じように**インデックス**（0 から）と**配列**も取得できます：

```html title="Component.html"
<for each="(cat, index, arr) of state.cats">
  <li>{index + 1}/{arr.length}: {cat.name}</li>
</for>
```

追加の名前は省略できます：`(cat, index)` でも動きます。

オブジェクトの場合は `(key, index, value)` を受け取ります。`value` は `obj[key]` です：

```html title="Component.html"
<for each="(key, index, value) in state.settings">
  <div>{index}. {key} = {value}</div>
</for>
```

カウント形式（`i of 6`）では、`i` がすでに 1 → 6 と数えているので、意味があるのは最初の名前だけです。

## key：項目が動く可能性があるなら付ける {#keys-add-one-when-items-can-move}

`key` を付けると、リストの並び替えや項目の追加・削除があったときに、Olum がどの項目がどれなのかを判断できます。

**key がない場合**、項目を削除したり移動したりすると、Olum は位置に基づいて行を再利用し、隣の項目のデータで埋めます。その行が「持っている」もの（チェックされたボックス、再生中の動画、入力したテキスト）が、間違った行に飛んだように見えます。**key がある場合**は、行そのものが移動します。

`key` は JavaScript の式（`{ }` なし）で、項目ごとに一意でなければなりません：

```html title="Component.html"
<!-- with components: each one keeps its own state -->
<for each="todo of state.todos" key="todo.id">
  <TodoRow todo="{todo}" />
</for>

<!-- with plain elements -->
<for each="todo of state.todos" key="todo.id">
  <li data-done="{todo.done}">{todo.text}</li>
</for>
```

:::note
key は `<for>` の直下の要素にだけ付けます。それより深い子要素には付けません。普通の要素に自分で `key="{item.id}"`（波括弧付き）と書くこともできます。`<for>` の書き方は、それを代わりにやってくれるだけです。
:::

## カウントは数字で直接書く {#the-count-must-be-a-written-number}

`each="i of 6"` は、数字をその場に直接書いたときにしか動きません。ステートの数値では動きません。代わりに配列を作ってください：

```html title="Component.html"
<!-- ✗ breaks: state.n is a number, not an array -->
<for each="i of state.n">…</for>

<!-- ✓ i goes 1 → n -->
<for each="i of Array.from({ length: state.n }, (_, k) => k + 1)">…</for>
```
