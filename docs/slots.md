---
title: Slots
group: Components
order: 140
---

Content placed between a component's tags is exposed as `children` on `props()`.

```html title="CounterCard.html"
<!-- parent -->
<CounterCard title="Score">
  <em>passed from the parent</em>
</CounterCard>

<!-- CounterCard.html -->
<script>
  import { props } from "olum";
  const { children } = props(); // stays LIVE — compiled into a fresh props().children read
</script>
<div class="slot">{children}</div>
```

Destructured names are [live](/docs/components): `{children}` always renders the **latest** slot content, even after the parent re-renders and passes different content. `{props().children}` is equivalent.

## Fallback content

`children` is empty when the parent passed nothing between the tags — render a fallback with `<if>` / `<else>`:

```html title="Box.html"
<!-- Box.html -->
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
<Box><p>This is a box.</p></Box>   <!-- renders the slot content -->
<Box />                            <!-- renders the fallback -->
```

:::note
Slot content is injected as **raw markup**, not escaped text — it's authored by the parent template, so it's trusted by design. Don't route untrusted strings through a slot; see [Escaping & Security](/docs/security).
:::
