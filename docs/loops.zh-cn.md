---
title: 循环
group: 模板语法
order: 100
source: 0588db1614c1
---

用 `<for>` 重复 HTML。`each` 接收一个 JavaScript 表达式（不需要 `{ }`）。有三种形式：

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

## 获取索引 {#getting-the-index}

使用括号还可以拿到**索引**（从 0 开始）和**数组**本身，就像 `Array.map` 一样：

```html title="Component.html"
<for each="(cat, index, arr) of state.cats">
  <li>{index + 1}/{arr.length}: {cat.name}</li>
</for>
```

额外的名称是可选的：`(cat, index)` 也可以。

对于对象，你会拿到 `(key, index, value)`，其中 `value` 就是 `obj[key]`：

```html title="Component.html"
<for each="(key, index, value) in state.settings">
  <div>{index}. {key} = {value}</div>
</for>
```

在计数形式（`i of 6`）中，只有第一个名称有用，因为 `i` 已经在从 1 数到 6 了。

## Key：当列表项可能移动时加上它 {#keys-add-one-when-items-can-move}

加上 `key`，这样在列表重新排序、或者有项被添加或移除时，Olum 才知道哪一项是哪一项。

**没有 key 时**，删除或移动某一项会让 Olum 按位置复用行，并用相邻项的数据填充它们。一行"拥有"的任何东西（勾选的复选框、正在播放的视频、已输入的文字）看起来都会跳到错误的行上。**有 key 时**，行会被移动。

`key` 是一个 JavaScript 表达式（不需要 `{ }`），每一项的 key 必须唯一：

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
key 只写在 `<for>` 的直接子元素上，不要写在更深层的子元素上。你也可以自己在普通元素上写 `key="{item.id}"`（带花括号）；`<for>` 上的写法只是帮你做了这件事。
:::

## 计数必须是直接写出的数字 {#the-count-must-be-a-written-number}

`each="i of 6"` 只有在数字直接写在那里时才有效。来自 state 的数字不行。请改为构造一个数组：

```html title="Component.html"
<!-- ✗ breaks: state.n is a number, not an array -->
<for each="i of state.n">…</for>

<!-- ✓ i goes 1 → n -->
<for each="i of Array.from({ length: state.n }, (_, k) => k + 1)">…</for>
```
