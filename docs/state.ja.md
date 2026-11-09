---
title: ステートとリアクティビティ
group: リアクティビティ
order: 30
source: 28d31ae11591
---

コンポーネントが表示するデータは `const state = { ... }` に入れます。**`state` を変更すると、ページは自動的に更新されます。**

```html title="Component.html"
<script>
  const state = { count: 0, user: { name: "Ann" } };

  const inc = () => state.count++;                 // page updates
  const rename = () => (state.user.name = "Bo");   // nested changes update it too
</script>

<p>{state.count} — {state.user.name}</p>
<button onclick="inc()">+</button>
```

:::warn
リアクティブなのは `state` だけです。普通の `const` や `let` の変数を変更しても、ページは更新**されません**。
:::

## `state` はリテラルのオブジェクトで書く {#write-state-as-a-literal-object}

トップレベルの `const state = { ... }` で、オブジェクトをその場に直接書く必要があります。`const state = makeState()` は検出されないので、何も更新されません。

## どの深さの変更も効く {#changes-at-any-depth-work}

ネストしたオブジェクト、配列、`Map`、`Set` はすべて追跡されます：

```js
state.user.name = "Bo";          // ✓ nested object
state.user.prefs.theme = "dark"; // ✓ any depth
state.todos.push(todo);          // ✓ array methods (push, splice, sort, …)
state.todos[0].done = true;      // ✓ array item
state.tags.add("new");           // ✓ Map / Set
```

それ以外の種類のオブジェクト（`Date`、DOM 要素、クラスのインスタンス）は追跡**されません**。それらを変更した後は、そのキーに**新しい**値を代入してください：`state.date = new Date(state.date)`。

:::warn
**同じ**オブジェクトを代入し直しても（`state.todos = state.todos`）、何も変わっていないので何も起きません。強制的に更新するには、新しい配列やオブジェクトを代入します（`[...state.todos]`、`map`、`filter`、`slice`、`{ ...obj }`）。
:::

## 派生値はただの関数 {#derived-values-are-just-functions}

ステートから計算した値が必要ですか？関数を書いて、テンプレートで呼び出しましょう。更新のたびに再実行されるので、常に最新です。関数同士で呼び合うこともできます：

```html title="Component.html"
<script>
  const state = { count: 1 };

  const doubled = () => state.count * 2;
  const quadrupled = () => doubled() * 2;
</script>

<p>{state.count} * 2 = {doubled()}</p>
<p>{doubled()} * 2 = {quadrupled()}</p>
```

## 更新はまとめられる {#updates-are-grouped}

連続した複数の変更（`state.a++; state.b++` や、大きな配列への 1 回の `splice`）が引き起こす更新は、何回分でもなく**1 回**です。しかも更新はページ上の[違う部分だけを変更](/docs/rendering)します。ですから `state` は一番読みやすい方法で変更してください。速度のために `push` や `splice` を避ける理由はありません。

注意点：ページはあなたの変更と同じ行ではなく、少し**後**に更新されます。更新後のページをすぐに読み取る必要がある場合（主にテスト）は、`flushUpdates()` を呼びます：

```js
import { flushUpdates } from "olum";

state.count++;
flushUpdates();                         // apply pending updates now
host.querySelector("span").textContent; // up to date
```

:::note
`window.olum.flushUpdates()` も同じことをしますが、開発中にしか使えません。本番環境の `window.olum` には（検出ツール用の）`version` と `framework` しかないので、代わりに `flushUpdates` をインポートしてください。
:::

[ウォッチャー](/docs/watchers)は異なり、変更のたびに 1 回、すぐに実行されます。

テンプレートで一度も使われていないステートのキーを変更しても、ページはまったく更新されません。[レンダリングと更新](/docs/rendering)を参照してください。
