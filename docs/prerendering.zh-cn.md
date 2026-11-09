---
title: 预渲染与 SEO
group: 构建与 SEO
order: 240
source: c22cfc43c2a1
---

Olum 应用运行在浏览器中。这对用户来说很好，但读取 `dist/blog/hello/index.html` 的搜索引擎或链接预览只会看到一个空壳。

**预渲染**解决了这个问题。在构建时，Olum 会在真正的浏览器中打开应用的每个页面，并把渲染完成的 HTML 保存为该页面自己的文件：

```text
npm run build
      ↓
compile + bundle
      ↓
collect every route
      ↓
open YOUR app in a real browser, once per route
      ↓
save the rendered HTML as that route's index.html
      ↓
deploy dist/ to any static host
```

你会得到更快的首次绘制、可用的深层链接，以及爬虫能读取的页面。页面在浏览器中加载后，它又是一个普通的 Olum 应用。

## 开启它 {#turn-it-on}

创建 **`src/sitemap.js`**。这个文件就是开关：没有它，构建就不会预渲染。

```js title="src/sitemap.js"
import { getPosts } from "./api.js";

export default async function () {
  const posts = await getPosts();
  return posts.map((post) => `/blog/${post.slug}`);
}
```

- 它导出一个**函数**，返回一个 **URL 数组**。它可以是 `async` 的。
- 它是普通代码：import、`fetch`、数据库客户端，任何 Node 能运行的东西都可以。
- 你只需要列出**动态路由的真实 URL**（比如 `blog/[slug]` 对应的 `/blog/hello`）。普通路由会根据你的 `page.html` 文件自动找到。

:::tip
`src/sitemap.js` 不是路由，也永远不会被发送到浏览器。它只在构建时运行。
:::

## 哪些页面会被预渲染 {#which-pages-get-prerendered}

你的普通路由，**加上** `sitemap.js` 返回的内容，去掉重复项：

```text
from your folders           from sitemap.js
  /                           /blog/hello
  /about                      /blog/world
  /blog                       /match/liverpool
  /blog/:slug        ✗ dropped (a pattern, not a URL)
  /match/:slug       ✗ dropped
        └────────────┬────────────┘
                     ▼
  /  /about  /blog  /blog/hello  /blog/world  /match/liverpool
```

`sitemap.js` 中没有任何路由能显示的 URL 会被跳过。

## 输出 {#the-output}

每个路由都会变成一个**包含自己的 `index.html` 的文件夹**：

```text title="dist/"
dist/
├── index.html                  ← "/"
├── sitemap.xml
├── about/
│   └── index.html              ← "/about"
├── blog/
│   ├── index.html              ← "/blog"
│   ├── hello/index.html        ← "/blog/hello"
│   └── world/index.html
├── match/
│   └── liverpool/index.html
└── assets/
    └── …
```

父文件夹只有在它本身是一个路由时才会有文件。如果没有任何东西定义了 `/match`，就不会有 `dist/match/index.html`。

每个文件都包含完整的页面，包括[你页面的 `<head>`](/docs/metadata)：

```html title="dist/blog/hello/index.html"
<!doctype html>
<html lang="en" data-olum>
  <head>
    <title>Hello — My Blog</title>
    <meta name="description" content="…" />
    …
  </head>
  <body>
    <div id="olum-app"><div data-olum="…"><article><h1>Hello</h1>…</article></div></div>
    <script type="module" src="/assets/index-<hash>.js"></script>
  </body>
</html>
```

构建会打印它写入了什么，以及每个页面有多大：

```text
SSG: 6 route(s) to prerender
 ✓ 1/6  /about
 ✓ 2/6  /blog
 …
SSG: prerendered 6 page(s)
SSG: sitemap.xml lists 6 URL(s)

/
├── about                   1.4 kB
├── blog                    1.1 kB
│   ├── hello               2.3 kB
│   └── world               2.1 kB
└── match
    └── liverpool           1.8 kB
```

## 不需要服务器重写规则 {#no-server-rewrite-needed}

没有预渲染时，你的托管服务必须对 `/blog/hello` 返回 `/index.html`（参见[构建与部署](/docs/build-and-deploy#deploying)）。有了预渲染，`/blog/hello` **就是一个真实的文件**，所以它在任何静态托管服务上都能用，**无需任何设置**。

:::tip
如果有些路由**没有**被预渲染（比如你没有写进 `sitemap.js` 的某个 `/blog/:slug`），还是保留 fallback。预渲染的路由加载自己的文件；其余的回退到外壳页面。
:::

## 加载数据的页面 {#pages-that-load-data}

在 `onMount` 中获取数据的页面**一开始是空的**：

```html title="src/match/[slug]/page.html"
<head>
  <title>{slug} vs {state.post?.opponent}</title>
</head>

<script>
  import { params, onMount } from "olum";
  import { getMatch } from "../../api.js";

  const { slug } = params();
  const state = { post: null };

  onMount(async () => {
    state.post = await getMatch(slug);
  });
</script>

<h1>{slug} vs {state.post?.opponent}</h1>
```

构建会在屏幕上一出现内容时就保存页面，这发生在 `await` 完成**之前**。如果不等待，你发布的就是加载中的状态。`SSG_DELAY`（默认 `500` 毫秒）会给每个页面留出完成的时间：

```json title="package.json"
{
  "olum": { "SSG_DELAY": 500 }
}
```

```html title="dist/match/liverpool/index.html"
<title>liverpool vs barcelona</title>
…
<h1>liverpool vs barcelona</h1>
```

`<head>` 会随页面一起更新，所以文件中同时包含内容和元数据。

### 选择一个值 {#picking-a-value}

从 200–500 毫秒开始。构建会告诉你它的代价：

```text
SSG: waiting 500ms after each route (+46.5s to this build)
```

然后**检查一个文件**，因为太短的延迟会悄无声息地失败：

```bash
grep -o "<title[^>]*>[^<]*</title>" dist/match/liverpool/index.html
```

还是显示加载状态？调大它。构建太慢？调小它，然后再检查一次。

:::warn
- **太短：** 构建会写入一个没完成的页面，却仍然打印 ✓。直到搜索流量下降之前都不会有人注意到。
- **太长：** 每个路由都要付出这个代价（500 毫秒 × 93 个路由 = 每次构建 46 秒）。
- 它是一个固定的等待，而不是一次检查。一个慢的 API 或繁忙的 CI 机器，可能会错过在你笔记本上没问题的值。如果可以，让预渲染页面需要的数据保持快速且在本地。
:::

## sitemap.xml {#sitemapxml}

每个被保存的路由都会列在 `dist/sitemap.xml` 中，并以当天的日期作为 `<lastmod>`。渲染失败的路由会被排除（失效的链接会影响你的搜索排名）。

搜索引擎需要 sitemap 中的完整 URL，所以请用 `SITE_URL` 告诉构建你的域名。没有它，构建会给出警告，并写入相对路径。

## 构建设置 {#build-settings}

全部放在 `package.json` 的 `olum` 键下。没有一项是必需的；构建会告诉你缺少了什么。

```json title="package.json"
{
  "olum": {
    "SITE_URL": "https://example.com",
    "SSG_DELAY": 500,
    "base": "/"
  }
}
```

### `SITE_URL` {#site_url}

你的域名，会加在 `sitemap.xml` 中每个 URL 的前面。搜索引擎会忽略那里的相对 URL，而构建也无法猜出你的域名。

| 设置为 | 结果 |
|--------|--------|
| `"https://example.com"` | `<loc>https://example.com/blog/hello</loc>` |
| 未设置 | 一条警告，以及爬虫会忽略的相对 `<loc>` 值 |

结尾的斜杠会被自动去掉。

### `SSG_DELAY` {#ssg_delay}

在页面出现之后、保存之前额外等待的时间，单位是**每个路由的毫秒数**。对[加载数据](#pages-that-load-data)的页面很有用。

| 设置为 | 结果 |
|--------|--------|
| 未设置 | 500 毫秒（**默认**） |
| `0` | 不等待 |
| `250` | 每个路由等待 250 毫秒 |
| 不是数字（`true`、`"soon"`、`-1`） | 一条错误消息，然后使用 500（构建不会失败） |

当每个页面都已经有了数据时，设为 `0`：否则这段等待只是在每个路由上白白浪费构建时间。

### `base` {#base}

网站所在的位置，默认是 `/`。参见 [Base URL](/docs/build-and-deploy#base-url)。

:::warn
预渲染只在 `"/"` 或 `"/app/"` 这样的子文件夹下有效。相对的 base（`"./"`）会破坏它：每个页面都在自己的文件夹中，所以 `./assets/…` 会在 `/blog/hello/assets/…` 中查找，从而失败。
:::

## 在浏览器中 {#in-the-browser}

爬虫、链接预览和首次绘制看到的是预渲染的 HTML。应用启动后，它会照常渲染到 `#olum-app` 中并接管页面。

:::note
预渲染的 HTML 会被**替换**，而不是被复用（"hydrated"）。任何必须延续到运行中应用的东西都应该放在 `state` 中，而不是保存的 HTML 中。
:::

## 预览 {#preview}

```bash
npm start
```

有 `src/sitemap.js` 时，`/blog/hello` 会提供 `dist/blog/hello/index.html`，所以你看到的是预渲染的页面。没有它时，每个路由都提供根目录的 `index.html`，就像真正的托管服务那样。

## 第一次构建会比较慢 {#the-first-build-is-slower}

预渲染需要一个浏览器：

- **vite** 会在第一次构建（任何构建）时安装。
- **puppeteer** 会在第一次进行预渲染的构建时安装，并下载一次 Chrome（约 150 MB）。

没有 `sitemap.js`，就不会下载 puppeteer。

## 须知 {#good-to-know}

- **失败的页面会被报告，但不是致命的。** 构建会打印 `✗ /blog/hello — failed to render …` 并继续。该路由保留普通的外壳页面，并被排除在 `sitemap.xml` 之外。
- 当路由器往 `#olum-app` 里放入了内容时（最多 15 秒），**页面就算准备好了**。这发生在 `onMount` 中的 fetch 完成之前，所以才需要 `SSG_DELAY`。
- **只会捕获加载时完成的工作。** 点击时加载的数据、比延迟更长的定时器、滚动观察器都不会出现在文件中，这通常正是你想要的。
- **`/` 被有意放在最后保存**：本地预览服务器会对未知 URL 使用 `dist/index.html`，所以在其他路由完成之前，它必须保持为一个空白外壳。
- **编译错误会让整个构建失败**，这样 CI 就能在部署前发现它们。

## 另请参阅 {#see-also}

- [页面元数据与 SEO](/docs/metadata)：每个页面写入其文件中的 `<head>`。
- [构建与部署](/docs/build-and-deploy)：构建输出和托管服务设置。
- [文件约定](/docs/router/file-conventions)：文件夹如何变成路由。
