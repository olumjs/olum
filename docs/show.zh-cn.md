---
title: 显示 / 隐藏
group: 模板语法
order: 90
source: b55bd0de179f
---

和 `<if>` 类似，但内容会**留在页面上**，只是被隐藏：

```html title="Component.html"
<show when="state.visible">
  <div class="panel">Always on the page; only hidden or shown.</div>
</show>
```

因为什么都没有被移除，正在播放的 `<video>`、正在运行的动画、输入框里已输入的文字，在隐藏后再显示时都会保留下来。

**工作原理：** `<show>` 会变成一个 `<div data-o-show>` 包裹元素。可见时它是 `display: contents`（不占空间，所以子元素看起来就像它不存在一样）。隐藏时它是 `display: none`。

:::note
- 包裹元素始终存在，所以像 `.parent > .panel` 这样的 CSS 规则不会匹配。请使用 `[data-o-show] > .panel`，或者去掉 `>`。
- `<table>` 或 `<select>` 中不允许出现 `<div>`，所以不要在表格行或选项外面使用 `<show>`。在那里请改用 [`<if>`](/docs/conditionals) 或 `style` 属性。
:::
