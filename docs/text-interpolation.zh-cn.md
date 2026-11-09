---
title: 文本插值
group: 响应式
order: 40
source: a6941c575829
---

把 JavaScript 值包在 `{ }` 中，就能在 HTML 中显示它。它总是以安全文本的形式显示：

```html title="Component.html"
<p>Hello {state.user.name}</p>
<p>Total: {state.items.length} items</p>
<p>{state.count > 0 ? 'positive' : 'zero'}</p>
```

## 须知 {#good-to-know}

- 值会被 **HTML 转义**，所以像 `<b>` 这样的文本会显示为文本，而不是 HTML。这能保护你免受 XSS 攻击。要显示真正的 HTML，请参见[原始 HTML](/docs/raw-html)。
- `null` 和 `undefined` 什么都不显示。
- 在文本中**没有办法转义 `{`**。任何 `{…}` 都会被当作代码。要显示字面量 `{`，可以写 `{String.fromCharCode(123)}`，或者把 `"{"` 放进一个 `const` 再显示它。
