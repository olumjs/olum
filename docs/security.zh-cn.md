---
title: 转义与安全
group: 进阶
order: 250
source: d8626fdc23d9
---

Olum 默认就保护你免受 XSS（注入脚本）攻击：除非你有意关闭，否则每个值都会被转义。

- **默认情况下**，文本和属性中的每个 `{expr}` 都会经过 HTML 转义（使用 `olum.esc`）。所以用户数据中的 `<script>` 会显示为文本、无法运行，`<` 或 `"` 这样的字符也无法破坏你的页面。
- **要插入真正的 HTML**（仅限可信内容），在元素上使用 `html="expr"`，或在行内使用 `olum.html(value)`。参见[原始 HTML](/docs/raw-html)。
- **插槽内容**（`children`）会作为 HTML 插入，因为它来自你自己的模板。参见[插槽](/docs/slots)。

:::danger{icon="🔒"}
永远不要把用户内容传给 `html=` 或 `olum.html()`。如果必须显示用户提供的 HTML，请先对它进行净化（sanitize）。
:::
