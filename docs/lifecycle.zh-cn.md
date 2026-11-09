---
title: 生命周期钩子
group: 组件
order: 180
source: 820ee91bfc75
---

`onMount` 会在组件**出现在页面上**时运行你的代码。如果你返回一个函数，它会在组件**被移除**时运行（即"清理"函数）。

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

清理函数会在组件被移除时运行（`<if>` 变为 false、带 key 的列表项被删除、路由变化），也会在整个应用通过 [`app.destroy()`](/docs/embedding) 关闭时运行（嵌入功能正在维护中）。

:::warn
每个组件只调用**一次** `onMount`。第二次调用会被忽略。把所有初始化代码放在一个回调里，并返回一个清理函数。
:::

## 加载数据 {#loading-data}

回调可以是 `async` 的。这是获取数据的常用位置：

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

## 定时器和全局监听器 {#timers-and-global-listeners}

在 `onMount` 中启动定时器、`requestAnimationFrame` 循环和 `window` / `document` 监听器，并在清理函数中停止它们：

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

## `host` {#host}

`host` 是这个组件自己的包裹元素，无需导入。请使用 `host.querySelector(…)` 而不是 `document.querySelector(…)`，后者可能会找到该组件另一个实例中的元素，或页面上别处的元素。

它在 `onMount` 和事件处理函数中（组件已经在页面上之后运行的任何代码）都可用，但在 `<script>` 的顶层**不可用**。

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

同样的启动/停止模式也适用于：

- `<canvas>` 绘制循环
- 用 `requestAnimationFrame` 跟踪的 `<video>`（`onplay`、`onpause` 和 `onloadedmetadata` 可以作为普通属性使用；你只需要在循环和 `video.currentTime` 这类东西上用到 `onMount`）
- 不能写成属性的事件，比如 `copy` 或 `paste`（参见[事件](/docs/events#events-you-must-add-by-hand)）

示例：[`/forms/host-element`](/forms/host-element)（canvas）、[`/forms/dimensions`](/forms/dimensions)（ResizeObserver）、[`/forms/media-elements`](/forms/media-elements)（视频播放器）。
