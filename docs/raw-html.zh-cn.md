---
title: 原始 HTML
group: 模板语法
order: 140
source: 484fb799da47
---

`{expr}` 永远显示为文本，而不是 HTML。当你确实需要插入 HTML 时，有两种方式。**只对你信任的 HTML 使用它们**（参见[转义与安全](/docs/security)）。

## `html="expr"`：填充一个元素 {#htmlexpr-fill-an-element}

元素的内容会变成这段 HTML（已有的子元素会被替换）：

```html title="Component.html"
<div html="state.articleHtml"></div>
<span html="state.richText"></span>
```

## `olum.html(value)`：内联 {#olumhtmlvalue-inline}

当 HTML 位于其他文本中间时，在 `{ }` 里使用它：

```html title="Component.html"
<p>Intro: {olum.html(state.snippetHtml)} — end.</p>
```

这两种写法都很容易在代码中搜索到，因此很容易审查哪里使用了原始 HTML。其他所有内容都会被转义。
