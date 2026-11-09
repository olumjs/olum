---
title: 构建与部署
group: 构建与 SEO
order: 220
source: c290ad764090
---

用一条命令为生产环境构建你的网站，然后把 `dist/` 文件夹上传到任意静态托管服务：

```bash
npm run build
```

它会编译你的组件，用 **vite**（首次构建时会自动为你安装）打包所有内容，并把结果写入 `dist/`：

```text title="dist/"
dist/
├── index.html                  ← entry page
└── assets/
    ├── index-<hash>.js         ← your app, minified
    ├── index-<hash>.css        ← main.css + all component styles
    ├── favicon-<hash>.svg
    └── ...                     ← every file from public/assets, plus code-split chunks
```

- **`public/` 中的所有内容都会被包含。** 打包工具能识别的文件会得到带哈希的文件名；在运行时字符串中使用的文件（比如 `url(/assets/{type}.svg)`）会被原样复制。参见[静态资源](/docs/static-assets)。
- **编译错误会中止构建。** 错误会被打印出来，不会写入任何文件，命令也会失败（这样 CI 就能发现问题）。

## 预览构建结果 {#preview-the-build}

```bash
npm start
```

它会像真正的托管服务那样提供 `dist/`，方便你在部署前检查。

## 预渲染（推荐） {#prerendering-recommended}

添加一个 `src/sitemap.js` 文件，构建时就会把每个路由另存为一个单独的 HTML 文件（`dist/about/index.html`、`dist/blog/hello/index.html` 等），外加一个 `sitemap.xml`。你会得到搜索引擎能读取的页面、更快的首次绘制，以及无需任何服务器设置就能用的深层链接。参见[预渲染与 SEO](/docs/prerendering)。

## 构建设置 {#build-settings}

所有构建设置都放在 `package.json` 的 `olum` 键下。全部都是可选的：

```json title="package.json"
{
  "olum": {
    "SITE_URL": "https://example.com",
    "SSG_DELAY": 500,
    "base": "/"
  }
}
```

| 设置 | 作用 |
|---------|--------------|
| `SITE_URL` | 你的域名，用于 `sitemap.xml`。没有它，搜索引擎会忽略 sitemap。 |
| `SSG_DELAY` | 预渲染时，在保存每个路由之前等待的时间（毫秒）。默认 `500`。如果没有页面在 `onMount` 中加载数据，就用 `0`。 |
| `base` | 网站所在的位置。默认 `/`。参见 [Base URL](#base-url)。 |

前两项在[预渲染与 SEO](/docs/prerendering#build-settings) 中有说明。

## 部署 {#deploying}

`dist/` 就是普通的静态文件。可以上传到任何地方：Netlify、Vercel、Cloudflare Pages、GitHub Pages、nginx、S3……

**如果你使用了预渲染**，什么都不需要配置。`/blog/hello` 是一个包含 `index.html` 的真实文件夹，任何托管服务都能提供它。

**如果你没有使用预渲染**，需要一项设置：

:::warn
路由器使用干净的 URL（**history 模式**），所以你的托管服务必须对每个不是真实文件的路径返回 `index.html`。否则刷新 `/blog/hello` 这样的页面会显示 404。托管服务通常把这叫作 "SPA fallback" 或 "rewrite all to /index.html"。
:::

```text title="Netlify — public/_redirects"
/*  /index.html  200
```

```json title="Vercel — vercel.json"
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

路由器无法检测到缺少重写规则。只有当浏览器没有 History API 时，它才会切换到 hash URL（`/#/blog/hello`）。

:::tip
在使用预渲染时保留 fallback 也没有坏处，而且当只有*部分*路由被预渲染时很有用：那些路由加载自己的文件，其余的回退到外壳页面。
:::

## Base URL {#base-url}

默认情况下，`dist/` 中的每个链接都从站点根目录开始：`/assets/index-abc123.js`。当你的网站位于域名根目录时这是正确的。如果不是，请设置 `base`：

```json title="package.json"
{
  "olum": { "base": "./" }
}
```

| `base` | 链接会变成 | 适用于 |
|--------|--------------|------------|
| 未设置或 `"/"` | `/assets/index-abc123.js` | 位于域名根目录的网站（**默认**） |
| `"./"` | `./assets/index-abc123.js` | 从磁盘打开 `dist/index.html`（`file://`）的桌面应用（nw.js、Electron） |
| `"/app/"` | `/app/assets/index-abc123.js` | 位于子文件夹中的网站，例如 GitHub Pages 的项目站点 |
| `"https://cdn.example.com/"` | `https://cdn.example.com/assets/index-abc123.js` | 资源放在 CDN 上，`index.html` 放在你的托管服务上 |

- 斜杠会自动修正：`"app"`、`"/app"` 和 `"/app/"` 是一样的。任何以 `.` 开头的值都会变成 `"./"`。
- 包含空格、引号或 `<` `>` 的值会被拒绝并报错，构建会使用 `/`。
- `BASE`（大写）也可以。
- 当 base 不是 `/` 时，构建会先打印 `building with base "./"`。
- 只有**构建**会使用它。`npm run dev` 始终从 `/` 提供服务。

### 哪些会被重写 {#what-gets-rewritten}

Vite 会修正它能识别的 URL（`public/index.html` 中的标签、导入的资源）。构建还会修正模板中指向 `public/` 里真实文件的 `src`、`href` 和 `poster`：

```html
<img src="/assets/logo.svg" />   <!-- with base "./" the bundle says ./assets/logo.svg -->
```

有两种情况**不会**被重写：

- **组件 `<style>` 中的 `url(...)`**，以及**在运行时拼出来的路径**（`url(/assets/{type}.svg)`）。它们保持 `/...`，所以对这些图片请改用模板中的 `src` 属性。
- **路由链接（`to="/about"`）**：它们是路由，不是文件。请使用路由器的 `root`（见下文）。

:::warn
不要把 `"./"` 和[预渲染](/docs/prerendering)一起使用。每个预渲染页面都在自己的文件夹中，所以 `./assets/…` 会在 `/blog/hello/assets/…` 中查找，从而失败。请使用 `/` 或 `/app/` 这样的子文件夹。
:::

### 子文件夹也需要配置路由器 {#a-sub-folder-needs-the-router-too}

`base` 移动的是你的**文件**，而不是你的**路由**。在 `/app/` 下，浏览器位于 `/app/about`，但你的路由是 `/about`，所以自动生成的路由器会显示 404 页面。请编写你自己的 `src/main.js`，并给路由器设置相同的 `root`：

```js title="src/main.js"
import Olum from "olum";
import Router from "olum-router";

import Home from "./page.js";
import About from "./about/page.js";

const routes = [
  { path: "/", comp: Home },
  { path: "/about", comp: About }
];

const router = new Router({ mode: "history", root: "/app", routes: routes });
new Olum().$("#olum-app").use(router);
```

一旦你创建了 `src/main.js`，路由就不再根据文件夹自动生成。你需要自己维护路由列表。参见[路由器](/docs/router/router#opting-out--your-own-mainjs)。
