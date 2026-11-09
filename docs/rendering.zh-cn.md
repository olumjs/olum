---
title: 渲染与更新
group: 响应式
order: 60
source: afc183e1b614
---

在 Olum 中你永远不需要调用 "render" 函数。你只要修改 [`state`](/docs/state) 或 [store](/docs/store/global-store)，页面就会更新。本页解释这中间发生了什么。

## 修改之后发生了什么 {#what-happens-after-a-change}

1. **修改被察觉。** 修改 `state`（任意深度）会把该组件标记为待更新。修改 store 会标记所有使用了该 store 的组件。
2. **更新被合并。** 所有被标记的组件会在你的代码执行完之后立即更新**一次**。`state.a++; state.b++`，或者一次移动 100 行的 `splice`，都只算一次更新。
3. **新的 HTML 在屏幕外构建。** 此时页面上还什么都没变。
4. **只应用差异。** Olum 会把新的 HTML 和页面进行比较，只修改不同的部分。没有变化的元素不会被触碰。

如果父组件和子组件同时需要更新，只有**父组件**会更新（它会顺带更新子组件）。

## 更新后哪些东西会保留 {#what-survives-an-update}

没有变化的元素保持原样，所以浏览器保存在它们上面的一切都会保留：

- 焦点、文本光标和文本选区
- 滚动位置（包括可滚动容器内部）
- 正在播放的 `<video>` 或 `<audio>`、正在运行的 CSS 动画和过渡
- `<iframe>` 和 `<canvas>` 的内容
- 任何模板没有设置的东西，比如没有绑定到 state 的输入框的值
- 事件监听器（只有当处理函数，或其中用到的值（比如循环变量）发生变化时，监听器才会被替换）

:::tip
这就是为什么 Olum 没有需要学习的"保持焦点"选项。放心更新即可。
:::

## 只有需要的组件才会更新 {#only-components-that-need-it-update}

- **未使用的键会被跳过。** Olum 知道每个模板读取了哪些 `state` 键。修改一个模板没有用到的键（比如只在处理函数或 `onMount` 中使用的键）不会更新任何东西。
- **store 的使用是自动的。** 组件只要在模板中*读取* store 就会订阅它。只往 store 写入的组件永远不会因它而更新。
- **已移除的组件会被跳过。** 已经不存在的组件（路由切换、关闭的 `<if>`）的待处理更新会被丢弃。

## Key：哪个元素是哪个 {#keys-which-element-is-which}

当列表变化时，Olum 会匹配新旧元素：

- 组件会保持它的身份，所以它会被复用，并保留它的 state。
- 普通元素可以通过 `key="{item.id}"`，或其 [`<for>`](/docs/loops) 上的 `key` 获得身份。
- 带 key 的元素会被**移动**，而不是重新创建（在浏览器支持时使用 `moveBefore`，所以即使是正在播放的视频也能保留下来）。
- 没有 key 的元素按位置匹配。Olum 仍然能识别简单的插入或删除，所以下面的行不会被重建。

没有 key 时，更大的变化（排序、过滤掉多行）无法用这种方式匹配：行会用相邻项的数据重新绘制，而不是移动。加上 `key` 就能解决。参见[限制](/docs/limitations)。

## 输入框永远不会被意外重置 {#inputs-are-never-reset-by-accident}

只有当**模板中**的值改变时，Olum 才会往输入框写入 `value` 或 `checked`。所以不相关的更新永远不会清掉正在输入的内容，但绑定到 state 的输入框在 state 变化时仍然会变化。如果写入的是当前聚焦的字段，光标会保持在原位。`<select>` 会保留用户的选择，除非模板移动了 `selected`。参见[双向绑定](/docs/two-way-binding)。

## 在修改后立即读取页面 {#reading-the-page-right-after-a-change}

因为更新会被合并，所以在修改的下一行，页面仍然是旧的。用 `flushUpdates()` 立即应用待处理的更新：

```js
import { flushUpdates } from "olum";

state.count++;
flushUpdates();                           // apply pending updates now
host.querySelector("span").textContent;   // up to date
```

任何时候调用它都是安全的（没有待处理的更新时它什么都不做）。主要在测试中，或者你需要测量新元素时有用。

:::note
如果某次更新失败，Olum 会打印 `patch failed — falling back to full re-render`，并从头重建该组件。页面依然是正确的，但焦点、媒体和滚动位置会被重置。请把这条警告作为 bug 报告给我们。
:::
