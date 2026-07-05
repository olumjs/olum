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
  const { children } = props(); // destructured once, at creation → INITIAL slot content
</script>
<div class="slot">{children}</div>
```

Destructuring takes a one-time **snapshot**. To always render the **latest** slot content — e.g. after the parent re-renders and passes different content — call `props().children` directly in the template:

```html title="CounterCard.html"
<div class="slot">{props().children}</div>
```
