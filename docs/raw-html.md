---
title: Raw HTML
group: Template Syntax
order: 140
---

`{expr}` always shows text, never HTML. When you really need to insert HTML, there are two ways. **Only use them with HTML you trust** (see [Escaping & Security](/docs/security)).

## `html="expr"`: fill an element

The element's content becomes the HTML (any children are replaced):

```html title="Component.html"
<div html="state.articleHtml"></div>
<span html="state.richText"></span>
```

## `olum.html(value)`: inline

Use it inside `{ }` when the HTML sits in the middle of other text:

```html title="Component.html"
<p>Intro: {olum.html(state.snippetHtml)} — end.</p>
```

Both are easy to search for in your code, so it's easy to review where raw HTML is used. Everything else is escaped.
