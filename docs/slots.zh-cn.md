---
title: 插槽
group: 组件
order: 170
source: 236ef6cfd7c4
---

你放在组件标签**之间**的任何内容，都会以 `children` 的形式传给子组件：

```html title="Parent.html"
<CounterCard title="Score">
  <em>passed from the parent</em>
</CounterCard>
```

```html title="CounterCard.html"
<script>
  import { props } from "olum";
  const { children } = props();
</script>

<div class="slot">{children}</div>
```

和其他 props 一样，`children` [始终是最新的](/docs/components#reading-props-in-the-child)：如果父组件之后传入了不同的内容，`{children}` 会显示新的内容。`{props().children}` 也可以。

## 后备内容 {#fallback-content}

没有传入任何内容时，`children` 为空。用 `<if>` / `<else>` 显示后备内容：

```html title="Box.html"
<script>
  import { props } from "olum";
  const { children } = props();
</script>

<div class="box">
  <if when="children">{children}</if>
  <else><em>no content was provided</em></else>
</div>
```

```html title="Parent.html"
<Box><p>This is a box.</p></Box>   <!-- shows the paragraph -->
<Box />                            <!-- shows the fallback -->
```

:::note
插槽内容会作为**真正的 HTML** 插入，而不是转义后的文本，因为它来自你自己的模板。永远不要通过插槽传递不可信的文本。参见[转义与安全](/docs/security)。
:::
