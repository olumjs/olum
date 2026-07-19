---
title: Raw HTML
group: Template Syntax
order: 120
---

All interpolation is escaped by default. Opt out **only for trusted/sanitized HTML**. Two ways:

## `html="expr"` — element-level

The element's content becomes the unescaped HTML of the expression (replaces any children):

```html title="Component.html"
<div html="state.articleHtml"></div>
<span html="state.richText"></span>
```

## `olum.html(value)` — inline, per-value

Use inside `{}` when you need raw HTML mixed with other text:

```html title="Component.html"
<p>Intro: {olum.html(state.snippetHtml)} — end.</p>
```

Both are greppable opt-outs. Everything else stays auto-escaped.
