---
title: 环境变量
group: 构建与 SEO
order: 225
source: 1efeaafd7814
---

把在你的电脑和线上站点之间不同的设置（比如 API 地址）放在 `.env` 文件里，在代码中用 `process.env.NAME` 读取。

```text title=".env.development"
API_URL="http://localhost:3000"
```

```text title=".env.production"
API_URL="https://api.example.com"
```

```html title="src/page.html"
<script>
  import { onMount } from "olum";
  const state = { posts: [] };

  onMount(async () => {
    const res = await fetch(process.env.API_URL + "/posts");
    state.posts = await res.json();
  });
</script>
```

`npm run dev` 访问 `http://localhost:3000`，构建出的站点访问 `https://api.example.com`。代码无需改动。

## 使用哪个文件 {#which-file-is-used}

文件放在项目根目录，和 `package.json` 放在一起：

| 命令 | 读取 |
|---------|-------|
| `npm run dev` | `.env`，然后 `.env.development` |
| `npm run build` | `.env`，然后 `.env.production` |

- `.env` 是可选的，存放两者共用的值。同一个名字在两个文件里都有时，后读的文件优先。
- 如果只有 `.env`，dev **和**构建都会用它。
- 一个文件都没有 → `process.env` 是一个空对象。

## 文件格式 {#file-format}

```text title=".env"
# a line starting with # is a comment
API_URL=https://api.example.com
export SITE_NAME="My Shop"    # quotes and `export` are optional
GREETING="Hello\nWorld"       # \n is a new line, inside double quotes only
```

**所有值都是字符串。** 需要自己转换：

```js
if (process.env.DEBUG) {}                        // ✗  DEBUG=false is the string "false", which is truthy
if (process.env.DEBUG === "true") {}             // ✓
const pageSize = Number(process.env.PAGE_SIZE);  // ✓  "20" → 20
```

名字请只用字母、数字和 `_`（`API_URL`、`apiUrl`）。

## 这里的一切都是公开的 {#everything-here-is-public}

:::danger[绝不要在这些文件里放密钥]
这些值**会被包含在构建产物中**：它们被写进 `dist/index.html` 和打包后的 JS，每个访客的浏览器都会下载它们，任何人都能读到。地址和功能开关没问题。**关键凭据**（私密的 API 密钥、数据库密码、私有令牌）必须放在**单独的后端**：你的应用调用那个后端，只有后端使用密钥。
:::

## 工作原理 {#how-it-works}

- **在 dev 中**，你的值会以一个设置 `process.env` 的小脚本加进 `index.html`，在你的任何代码运行之前执行。`public/index.html` 里的内联脚本也能读取它。
- **在构建中**，每个完整写出的 `process.env.NAME` 都会在打包后的 JS 里被替换成它的值。永远不会成立的判断后面的代码（`DEBUG=false` 时的 `if (process.env.DEBUG === "true")`）会从包中移除。
- `process.env[name]` 和文件里没有的名字在构建中依然可用：它们从 `dist/index.html` 里的同一个脚本读取。

## 须知 {#good-to-know}

- **编辑 `.env` 文件后请重启 `npm run dev`。** 开发服务器在启动时读取它们。
- `process.env.NODE_ENV` 不是你的值：构建会把它变成 `"production"`，在 dev 中它是 `undefined`，除非你把它写进 `.env.development`。
- 不要在 `public/index.html` 里自己创建 `process`（`const process = { env: {} }`）。它会遮住 Olum 添加的值，导致 dev 中 `process.env` 为空。
