---
title: 条件分岐
group: テンプレート構文
order: 80
source: 4117f1ba9e5d
---

条件に応じて異なる HTML を表示します。`when` には JavaScript の式を書きます（`{ }` は不要です）：

```html title="Component.html"
<if when="state.tab === 'a'">
  <p>Tab A</p>
</if>
<else-if when="state.tab === 'b'">
  <p>Tab B</p>
</else-if>
<else>
  <p>Fallback</p>
</else>
```

どんな JavaScript の条件でも使えます：

```html title="Component.html"
<if when="state.count >= 5 && state.count < 10">in range</if>
```

条件が false のとき、中身はページから**削除**されます。隠すだけにしたい場合は [`<show>`](/docs/show) を使います。
