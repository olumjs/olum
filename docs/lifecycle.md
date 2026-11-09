---
title: Lifecycle Hooks
group: Components
order: 180
---

`onMount` runs your code when the component **appears on the page**. If you return a function, it runs when the component is **removed** (the "cleanup").

```html title="Component.html"
<script>
  import { onMount } from "olum";

  onMount(() => {
    console.log("mounted");
    return () => {
      console.log("removed");
    };
  });
</script>
```

The cleanup runs when the component is removed (an `<if>` turns false, a keyed list item is deleted, the route changes) and when the whole app is shut down with [`app.destroy()`](/docs/embedding) (embedding is under maintenance).

:::warn
Call `onMount` **once** per component. A second call is ignored. Put all your setup in one callback and return one cleanup.
:::

## Loading data

The callback can be `async`. It's the usual place to fetch data:

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

## Timers and global listeners

Start timers, `requestAnimationFrame` loops and `window` / `document` listeners in `onMount`, and stop them in the cleanup:

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

`host` is this component's own wrapper element. No import needed. Use `host.querySelector(…)` instead of `document.querySelector(…)`, which could find an element in another copy of the component or elsewhere on the page.

It's ready in `onMount` and in event handlers (anything that runs after the component is on the page), but **not** at the top level of `<script>`.

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

The same start/stop pattern works for:

- a `<canvas>` drawing loop
- a `<video>` you follow with `requestAnimationFrame` (`onplay`, `onpause` and `onloadedmetadata` work as normal attributes; you only need `onMount` for the loop and for things like `video.currentTime`)
- events that can't be written as attributes, like `copy` or `paste` (see [Events](/docs/events#events-you-must-add-by-hand))

Examples: [`/forms/host-element`](/forms/host-element) (canvas), [`/forms/dimensions`](/forms/dimensions) (ResizeObserver), [`/forms/media-elements`](/forms/media-elements) (video player).
