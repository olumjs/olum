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

Observers and hand-wired element listeners follow the same shape — start in the callback, stop in the cleanup:

```html title="Box.html"
<script>
  import { onMount } from "olum";

  const state = { w: 0, h: 0 };

  onMount(() => {
    const box = host.querySelector(".box");
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      state.w = Math.round(rect.width);
      state.h = Math.round(rect.height);
    });
    observer.observe(box);

    return () => observer.disconnect();
  });
</script>

<p>measured: {state.w}px × {state.h}px</p>
<div class="box">…</div>
```

The same shape covers a `<canvas>` drawing loop, a `<video>` you follow with `requestAnimationFrame` (`onplay`, `onpause` and `onloadedmetadata` also work inline — `onMount` is only needed for the loop and for state the element owns, like `video.currentTime`), and events the compiler does not know inline, such as `copy` or `paste` — see [Events](/docs/events).

Working examples: [`/forms/host-element`](/forms/host-element) (canvas), [`/forms/dimensions`](/forms/dimensions) (ResizeObserver), [`/forms/media-elements`](/forms/media-elements) (a video player).

:::warn
Call `onMount` **once** per component — only the first call is wired; a second call is silently ignored. Put all setup in the one callback and return one combined cleanup.
:::
