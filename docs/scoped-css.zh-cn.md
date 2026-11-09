---
title: 作用域 CSS
group: 组件
order: 190
source: 57a6aaecd0a7
---

组件 `<style>` 中的 CSS 只影响**这个组件**。像平常一样写 CSS 即可：

```html title="Component.html"
<style>
  .title { color: #4f46e5; }   /* won't affect other components */
</style>
<h1 class="title">Hello</h1>
```

**工作原理：** Olum 会给组件的元素加上一个唯一的属性，并把它加到每个选择器上（`p:hover` 变成 `p[data-o-x]:hover`）。子组件有自己的属性，所以即使是 `.card p` 也不会影响嵌套组件里的 `<p>`。

## 全局样式 {#global-styles}

以 `:root`、`html` 或 `body` 开头的选择器**不会**被加上作用域。当组件需要全局 CSS 时就用它们：

```html title="Component.html"
<style>
  :root { --brand: #25c97e; }        /* a global CSS variable */
  body { overflow: hidden; }          /* global while this style is on the page */
  .panel { color: var(--brand); }     /* scoped as usual */
</style>
```

对于不属于某个组件的全应用样式，请使用 `public/main.css`。

## 须知 {#good-to-know}

- **`@keyframes` 按组件区分。** `@keyframes fade` 会被重命名为 `fade-<ComponentName>`（你的 `animation` / `animation-name` 也会相应更新），所以两个组件可以各自拥有一个 `fade` 而不冲突。
- **`@media`、`@supports`、`@layer`、`@container`**：其中的规则照常加上作用域。
- **`@font-face`** 保持原样。
- **CSS 注释**会被移除。
- 样式**每个组件只添加一次**，在组件首次出现时，以 `<style id="olum-style-<Name>">` 的形式加到 `<head>` 中。该组件的所有实例共享它。
- `url(...)` 必须以 `/` 开头（`url(/assets/x.svg)`），否则在嵌套页面上会失效。参见[静态资源](/docs/static-assets)。
- 没有用于组件包裹 `<div>` 的 `:host` 选择器。请直接为你自己的元素设置样式。
