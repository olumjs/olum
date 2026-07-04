---
title: Slots
group: Components
order: 140
---

Content placed between a component's tags is available as `{children}` inside that component.

```html title="CounterCard.html"
<!-- parent -->
<CounterCard title="Score">
  <em>passed from the parent</em>
</CounterCard>

<!-- CounterCard.html -->
<div class="slot">{children}</div>
```
