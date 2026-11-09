---
title: 页面元数据与 SEO
group: 构建与 SEO
order: 230
source: 99b6016ebaac
---

页面可以直接在它的 `page.html` 中设置自己的 `<head>`（标题、描述、社交卡片、canonical 链接、JSON-LD）：

```html title="src/blog/[slug]/page.html"
<head>
  <title>{post.title} — My Blog</title>
  <meta name="description" content="{post.excerpt}" />
  <link rel="canonical" href="https://example.com/blog/{slug}" />

  <meta property="og:title" content="{post.title}" />
  <meta property="og:image" content="{post.cover}" />
  <meta name="twitter:card" content="summary_large_image" />
</head>

<script>
  import { params } from "olum";
  import { getPost } from "../../api.js";

  const { slug } = params();
  const post = getPost(slug);
</script>

<article>
  <h1>{post.title}</h1>
  {post.body}
</article>
```

`<head>` 中的 `{expr}` 可以使用 `<script>` 中的任何东西（`state`、`params()`、`props()`、你的常量），和模板一样。

## 只有页面可以有 `<head>` {#only-pages-can-have-a-head}

| 文件 | 允许 `<head>`？ |
|------|-------------------|
| `page.html` | ✅ 是 |
| `not-found.html` | ✅ 是 |
| 其他任何组件 | ❌ 会被忽略，并在构建时给出警告，告诉你应该把它移到哪里 |

:::warn
- 要闭合标签：`<head> … </head>`。未闭合的 `<head>` 会被忽略（并给出警告）。
- 一个文件中只有**第一个** `<head>` 会被使用。
:::

## 它如何与 `public/index.html` 合并 {#how-it-combines-with-publicindexhtml}

`public/index.html` 是起点。你页面中的标签会合并进去：

- 如果你的页面有一个**同类**标签，它会在原来的位置**替换**掉原有的标签。
- 如果没有，你的标签会被**添加**到末尾。
- 其他一切保持原样，包括 Olum 的 `<style>` 标签和打包工具的 `<script>` / `<link>` 标签。

什么算"同类"：

| 标签 | 当以下内容相同时视为同类…… |
|-----|------------------------|
| `<title>`、`<base>` | （每个页面只有一个） |
| `<meta charset>` | `charset` |
| `<meta name>`、`<meta property>`、`<meta http-equiv>`、`<meta itemprop>` | name / property |
| `<link rel="canonical" \| "icon" \| "apple-touch-icon" \| "manifest" \| "amphtml">` | `rel`（每个页面只有一个） |
| `<link rel="stylesheet" \| "preload" \| "preconnect" \| …>` | `rel` **和** `href`，所以页面会**添加**一个样式表，而不是替换你的 |
| `<script type="application/ld+json">` | 每个页面一个（如果需要多个，给每个加上 `id`） |

**示例。** 外壳中有一个 `<title>`、`charset`、`description`、`viewport` 和一个样式表。页面声明了一个 `<title>`、一个 `description` 和 `og:title`。结果：标题和描述被**替换**，`og:title` 被**添加**，`charset`、`viewport` 和样式表**保持不变**。

`not-found.html` 的工作方式相同，所以你的 404 页面可以设置自己的 `<title>` 和 `robots`。

:::tip
把全站通用的标签（`charset`、`viewport`、favicon、样式表、`theme-color`）放在 `public/index.html` 中。页面的 `<head>` 中只放该页面特有的标签。
:::

### 切换页面总是干净的 {#changing-pages-is-always-clean}

每次加载路由时，Olum 都会**先把 head 重置为 `public/index.html`**，然后再应用新页面的标签。所以上一个页面的 `og:image` 永远不会泄漏到下一个页面。没有 `<head>` 的页面得到的就是原始的 head。

:::note
被替换的标签会保存在一个隐藏的 `<template data-olum-head>` 中（[预渲染](/docs/prerendering)的页面就是靠它来恢复这些标签的），页面添加的标签会带有 `data-olum-head` 属性。两者都无害，忽略它们即可。
:::

## 结构化数据（JSON-LD） {#structured-data-json-ld}

在 `<script type="application/ld+json">` 中，普通的 `{` 就是正常的 JSON。`{expr}` 只在**双引号字符串内部**有效，并且值会被**原样**插入（不做 HTML 转义），以保证 JSON 有效：

```html title="src/match/[slug]/page.html"
<head>
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "SportsEvent",
      "name": "{match.name}",
      "url": "https://example.com/match/{slug}",
      "startDate": "{match.kickoff}"
    }
  </script>
</head>
```

:::warn
因为值是原样插入的，其中的 `"` 或 `\` 会破坏 JSON。对于用户提供的文本，请使用 `{JSON.stringify(match.name)}`，**不要**在外面加引号。
:::

## 其他地方的转义 {#escaping-everywhere-else}

在 JSON-LD 之外，`{expr}` 会被 **HTML 转义**，和模板中一样，所以描述中的引号无法破坏标签。

| 你写的 | 你得到的 |
|-----------|---------|
| `` ` `` | 一个反引号（已为你转义） |
| `\` | 一个反斜杠（已为你转义） |
| `${x}` | `$` 后面跟着 `{x}` 的值（`$` 只是普通文本） |

## 它会随你的 state 更新 {#it-updates-with-your-state}

head 会和页面一起重新渲染，在开发环境**和**生产环境中都是如此：

```html title="src/blog/[slug]/page.html"
<head>
  <title>{state.post.title} — My Blog</title>
</head>

<script>
  import { onMount } from "olum";
  const state = { post: { title: "Loading…" } };

  onMount(async () => {
    state.post = await fetchPost();   // the tab title updates
  });
</script>
```

只有**页面**控制 head。子组件永远不会触碰它，并且只有当 head 的输出真正变化时才会重新应用。

:::warn
社交预览（Twitter、Slack、Facebook、LinkedIn）不运行 JavaScript；它们只读取 HTML 文件。要让它们看到你的标签，页面必须经过[预渲染](/docs/prerendering)。如果标题来自一个 `await`，构建也必须等待它：这正是 `SSG_DELAY` 的用途。
:::

## 在哪里生效 {#where-it-applies}

- **`npm run dev`**：在路由加载时以及每次重新渲染时应用。
- **使用预渲染的 `npm run build`**：写入每个路由的 `index.html`，所以爬虫无需 JavaScript 就能读到。
- **不使用预渲染的 `npm run build`**：只在浏览器中应用。不运行 JavaScript 的工具看到的是 `public/index.html` 的 head。
