---
title: 组件文件结构
group: 入门
order: 10
source: 59f27b670f3a
---

一个组件就是一个 `.html` 文件。它可以包含三个部分：

- `<script>`：你的 JavaScript（数据和函数）
- `<style>`：你的 CSS（只影响这个组件）
- 其余所有内容：HTML 模板

```html title="Counter.html"
<script>
  const state = { count: 0 };
  const inc = () => state.count++;
</script>

<style>
  .counter { font-weight: 700; }
</style>

<div class="counter">
  Count: {state.count}
  <button onclick="inc()">+</button>
</div>
```

模板可以使用 `<script>` 中声明的所有内容：`state`、你的函数，以及你从 [`props()`](/docs/components) 中取出的名称。

## 须知 {#good-to-know}

- **文件名就是组件名。** `CounterCard.html` 会成为 `CounterCard` 组件。请使用 PascalCase（每个单词首字母大写）。
- **组件标签也是 PascalCase**：`<CounterCard />`。Olum 正是靠这个大写字母把你的组件和 `<div>` 这样的普通 HTML 标签区分开。
- **`<script>` 和 `<style>` 都是可选的。** 只有 HTML 的文件也是有效的组件。
- **`<style>` 会自动加上作用域。** 参见[作用域 CSS](/docs/scoped-css)。
- **每个组件都被包裹在一个 `<div>` 中**，这是 Olum 添加的。这个 `<div>` 就是 [`host`](/docs/lifecycle) 元素。在组件周围写 `.parent > .child` 这样的 CSS 时要记住这一点。
- **页面文件还可以有 `<head>`。** 只有路由文件（`page.html` 和 `not-found.html`）可以设置页面标题、描述和其他 meta 标签。在其他任何组件中，`<head>` 都会被忽略，构建时会打印一条警告。参见[页面元数据与 SEO](/docs/metadata)。

```html title="src/blog/[slug]/page.html"
<head>
  <title>{post.title} — My Blog</title>
  <meta name="description" content="{post.excerpt}" />
</head>

<script>
  import { params } from "olum";
  const { slug } = params();
  const post = getPost(slug);
</script>

<article><h1>{post.title}</h1></article>
```
