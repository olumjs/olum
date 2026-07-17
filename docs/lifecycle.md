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
- The callback can be `async` — the usual place to fetch initial data:

```html title="Component.html"
<script>
  import { onMount } from "olum";

  const state = { photos: [] };

  onMount(async () => {
    const res = await fetch("/api/photos");
    state.photos = await res.json();
  });
</script>
```

Timers, `requestAnimationFrame` loops, and global `window` / `document` listeners belong in `onMount` too — start them in the callback, stop them in the cleanup:

```html title="Component.html"
<script>
  import { onMount } from "olum";

  const state = { seconds: 0 };

  onMount(() => {
    const interval = setInterval(() => state.seconds++, 1000);
    return () => clearInterval(interval);
  });
</script>

<p>Open for {state.seconds} {state.seconds === 1 ? "second" : "seconds"}</p>
```

## `host`

Inside `onMount`, `host` refers to this component's own root DOM element — no import needed. Use it to query within the component instead of `document.querySelector`, which could match another instance or an unrelated element elsewhere on the page.

```html title="Component.html"
<script>
  import { onMount } from "olum";

  onMount(() => {
    const main = host.querySelector("main");
  });
</script>
```
