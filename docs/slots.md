---
title: Slots
group: Components
order: 170
---

Anything you put **between** a component's tags reaches the child as `children`:

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

Like other props, `children` is [always up to date](/docs/components#reading-props-in-the-child): if the parent passes different content later, `{children}` shows the new one. `{props().children}` works too.

## Fallback content

`children` is empty when nothing was passed. Use `<if>` / `<else>` to show a fallback:

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
Slot content is inserted as **real HTML**, not escaped text, because it comes from your own template. Never pass untrusted text through a slot. See [Escaping & Security](/docs/security).
:::
