---
title: 限制
group: 进阶
order: 270
source: 63fd71405920
---

Olum 有意保持小巧，所以缺少一些功能。每一项都有简单的替代方案。

## 1. 没有 `key` 的列表按位置匹配行 {#1-lists-without-key-match-rows-by-position}

如果一个没有 key 的 `<for>` 列表被重新排序，各行会用相邻项的数据重新绘制，所以像勾选的复选框这样的东西看起来会跳到错误的行上。加上 [`key`](/docs/loops#keys-add-one-when-items-can-move)，行就会被移动。参见[渲染与更新](/docs/rendering#keys-which-element-is-which)。

## 2. 没有元素 ref 或 action {#2-no-element-refs-or-actions}

没有 `bind:this`，也没有 `use:action`。请自己在 [`onMount`](/docs/lifecycle) 中实现：用 `host` 找到元素，并返回一个清理函数：

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

`onMount` 只运行一次，而不是每次更新都运行。这没问题：更新会[就地修改元素](/docs/rendering)，所以按钮始终是同一个元素，会一直正常工作。如果行为依赖于 state，就在它的处理函数中读取 state。

（动画**是**内置的。参见[过渡](/docs/transition/transitions)。）

## 3. 没有 `<window>` / `<document>` / `<body>` 元素 {#3-no-window--document--body-elements}

要监听全局事件，在 `onMount` 中添加监听器，并在清理函数中移除它：

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

`selectionchange` 这样的 `document` 事件也一样。

## 4. 没有动态组件标签 {#4-no-dynamic-component-tag}

没有 `<component is="…">`。请用 `<if>` / `<else-if>` 配合 state 中的值：

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

## 5. 函数 prop 必须是一个名称 {#5-function-props-must-be-a-name}

在你自己的组件上，函数 prop 只有在它是一个简单的**名称**时才有效（父组件 `<script>` 中的函数，或来自 `props()` 的函数）。内联箭头函数、`obj.fn` 或函数调用都不会以函数的形式传过去：

```html title="Parent.html"
<!-- <Input/> = YOUR component, not the HTML <input/> -->
<Input oninput="{handleInput}" />              <!-- ✓ -->
<Input oninput="(e) => state.text = e" />      <!-- ✗ arrives as text -->
<Input oninput="{(e) => state.text = e}" />    <!-- ✗ arrives as undefined -->
```

普通 HTML 标签不受影响：在那里 `on*` 中写内联代码没问题（[事件](/docs/events)）。要传递额外的数据，把它作为单独的 prop 传入，再让子组件把它传回来（[组件与 Props](/docs/components#function-props)）。
