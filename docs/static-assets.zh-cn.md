---
title: 静态资源
group: 入门
order: 20
source: 2c152bc5a54e
---

把图片、图标、字体和可下载文件放在 `public/` 文件夹中。其中的所有内容都从**站点根目录**提供：`public/assets/logo.svg` 可以通过 `/assets/logo.svg` 访问。

## URL 总是以 `/` 开头 {#always-start-the-url-with}

```html title="Component.html"
<!-- ✓ works on every page, in dev and in production -->
<img src="/assets/logo.svg" />

<style>
  .icon { background: url(/assets/folder.svg) no-repeat; }
</style>

<!-- ✗ breaks in production -->
<img src="assets/logo.svg" />
```

**原因：** Olum 在运行时才把你的模板和样式加到页面上，所以浏览器会相对于当前页面解析相对 URL。在 `/shop/cart` 上，`assets/logo.svg` 会变成 `/shop/assets/logo.svg`，而这个文件并不存在。

:::warn
开发服务器会掩盖这个错误：它会尝试更短的路径直到找到文件，所以相对 URL 在开发时*看起来*能用。真正的托管服务不会这样做。请始终写 `/assets/...`。
:::

## 动态路径 {#dynamic-paths}

URL 只是一个字符串，所以你可以在其中使用 `{expr}`。保留开头的 `/`：

```html title="File.html"
<span style="background-image: url(/assets/{type}.svg)">{name}</span>
```

[构建](/docs/build-and-deploy)会把 `public/` 中的每个文件都复制到输出目录，所以这样使用的文件始终存在。

## 站点不在域名根目录？ {#site-not-at-the-domain-root}

依然写 `/assets/...`。如果你把 [`base`](/docs/build-and-deploy#base-url) 设置成了 `/` 以外的值（子文件夹、CDN、`file://` 桌面应用），构建会为你修正指向 `public/` 中真实文件的 `src`、`href` 和 `poster` 值。

:::warn
有两种情况**不会**被修正，仍然保持 `/...`：组件 `<style>` 中的 `url(...)`，以及像 `url(/assets/{type}.svg)` 这样在运行时拼出来的路径。使用自定义 base 时它们会找不到文件。对这些图片，请改用模板中的 `src` 属性。
:::

:::note
`public/index.html`（你的应用外壳）和 `public/main.css`（你的全局 CSS）会经过构建处理。`public/` 中的其他所有内容都会原样发布，所以不要在那里留下临时文件。
:::
