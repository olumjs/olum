---
title: Lifecycle Hooks
group: Advanced
order: 190
---

Import `onMount` from `olum` and call it with a callback. The callback runs when the component mounts; return a function from it to run cleanup on unmount.

```html title="Component.html"
<script>
  import { onMount } from "olum";

  onMount(() => {
    console.log("mounted");
    return () => {
      console.log("unMounted");
    };
  });
</script>
```

- The `onMount` callback runs when the component is inserted into the DOM.
- The **returned cleanup function** runs when it's removed (e.g. an `<if>` toggles it off, or a keyed list item is removed).
