---
title: 条件渲染
group: 模板语法
order: 80
source: 4117f1ba9e5d
---

根据条件显示不同的 HTML。`when` 接收一个 JavaScript 表达式（不需要 `{ }`）：

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

任何 JavaScript 条件都可以：

```html title="Component.html"
<if when="state.count >= 5 && state.count < 10">in range</if>
```

当条件为 false 时，内容会从页面中**移除**。如果只想隐藏它，请使用 [`<show>`](/docs/show)。
