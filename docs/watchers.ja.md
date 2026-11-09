---
title: ウォッチャー
group: リアクティビティ
order: 50
source: e67e52f5534e
---

ウォッチャーは、`state` のキーが変わったときにコードを実行します。`const watcher = { ... }` を宣言し、キーごとに関数を 1 つ書きます。各関数は古い値と新しい値を受け取ります：

````html title="Component.html"
<script>
  const state = { count: 0, log: "—" };
  const watcher = {
    count(old, next) {
      state.log = `count: ${old} → ${next}`;
    },
  };
</script>
<p>{state.count} — {state.log}</p>
````

ウォッチャーは変更 1 回につき 1 回、**すぐに**実行されます（ページの更新はまとめられますが、ウォッチャーはまとめられません）。

:::warn
ウォッチャーが実行されるのは、**そのキー自体に代入したとき**だけです：`state.user = ...`。`state.user.name = "Bo"` や `state.todos.push(t)` のようなネストした変更はページを更新しますが、ウォッチャーは実行**しません**。ウォッチャーを動かしたい場合は新しい値を代入します：`state.user = { ...state.user, name: "Bo" }`。
:::
