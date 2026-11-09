---
title: 属性
group: 模板语法
order: 70
source: 85c49fc9c132
---

## 普通属性：文本中包含 `{ }` {#normal-attributes-text-with---inside}

像写普通 HTML 一样写属性。在**引号内**为会变化的部分加上 `{expr}`：

```html title="Component.html"
<div class="card {state.active ? 'is-active' : ''}"></div>
<a href="/users/{state.user.id}" title="Open {state.user.name}">Profile</a>
<img src="/avatars/{state.user.id}.png" alt="avatar" />
<input id="field-{state.index}" type="text" />

<!-- inline style is just text too (use CSS names like background-color) -->
<div style="color:{state.color}; background:{state.bg}; padding:8px;">box</div>
```

## 代码属性：不需要 `{ }` {#code-attributes-no---needed}

有几个属性直接存放 JavaScript：`when`、`each`、`key`、`on*`（事件）和 `html`。它们各自有单独的页面。

```html title="Component.html"
<if when="state.count > 0"> … </if>
<button onclick="inc()">+</button>
```

:::tip[唯一要记住的规则]
这个属性是**代码**还是**文本**？HTML 本身已经告诉你了：`onclick=""` 是代码，`class=""` 是文本。代码属性（`when`、`each`、`key`、`on*`、`html`）直接接收 JavaScript。其他所有属性都是文本，会变化的部分用 `{ }`。
:::

## 布尔属性 {#boolean-attributes}

对于 `disabled` 或 `checked` 这样的属性，浏览器只检查该属性**是否存在**：`checked="false"` 仍然是选中的！所以当整个值是一个 `{expr}` 时，Olum 会在它为真值时**添加**该属性，为假值时**移除**它：

```html title="Component.html"
<button disabled="{state.busy}">Save</button>
<input type="checkbox" checked="{state.on}" />
<details open="{state.expanded}">…</details>
```

适用于：`checked`、`disabled`、`selected`、`readonly`、`required`、`hidden`、`autofocus`、`multiple`、`open`、`loop`、`muted`、`controls`、`autoplay`、`novalidate`、`default`、`defer`、`ismap`、`reversed`。

:::note
值必须**恰好是一个** `{expr}`。像 `checked="a {b}"` 这样的写法对布尔属性来说没有意义。
:::

## 文件 URL 以 `/` 开头 {#file-urls-start-with}

指向 `public/` 中文件的 `src`、`href` 和 CSS `url()` 必须以 `/` 开头：写 `/assets/logo.svg`，不要写 `assets/logo.svg`。否则它们在生产环境中会失效。参见[静态资源](/docs/static-assets)。
