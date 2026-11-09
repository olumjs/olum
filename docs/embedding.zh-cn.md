---
title: 在 React 和 Vue 中嵌入
group: 进阶
order: 260
source: 391c7fa601da
---

Olum 应用可以运行在 React 或 Vue 应用内部。像平常一样挂载它，并在宿主应用移除它时调用 `app.destroy()`。

:::warn[维护中]
嵌入功能仍在开发中。`app.destroy()` 已经存在，但这个 API 和这些规则可能会变化。暂时不要在生产环境中依赖它。
:::

```js title="main.js"
import Olum from "olum";
import App from "./App.js";

const app = new Olum();
app.$("#olum-app").use(App); // mount
app.destroy();               // unmount and clean up
```

`$()` 接收一个 CSS 选择器**或一个元素**，所以你可以直接传入 React 或 Vue 的 ref。

## `destroy()` 做了什么 {#what-destroy-does}

- 运行每个组件 [`onMount`](/docs/lifecycle) 的清理函数（先子组件）。
- 移除 Olum 在 `window` 上的监听器，并丢弃所有待处理的更新。
- 把 `document.head` 恢复到 Olum 修改之前的样子（参见[页面元数据](/docs/metadata)）。
- 清空根元素。

调用两次是安全的，在 `use()` 之前调用则什么都不做。组件的 `<style>` 标签会留在 `<head>` 中（每个只添加一次，所以之后再次挂载时依然有它的 CSS）。

## React {#react}

```jsx title="OlumMount.jsx"
import { useEffect, useRef } from "react";
import Olum from "olum";

export default function OlumMount({ app: App }) {
  const ref = useRef(null);

  useEffect(() => {
    const app = new Olum();
    app.$(ref.current).use(App);
    return () => app.destroy();
  }, [App]);

  return <div ref={ref} />;
}
```

在开发环境中，React StrictMode 会挂载、销毁、再挂载一次。这没问题：每个 `new Olum()` 都是全新开始的。

## Vue {#vue}

```html title="OlumMount.vue"
<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";
import Olum from "olum";

const props = defineProps({ app: Function });
const el = ref(null);
let app;

onMounted(() => {
  app = new Olum();
  app.$(el.value).use(props.app);
});
onBeforeUnmount(() => app.destroy());
</script>

<template><div ref="el"></div></template>
```

## 规则 {#rules}

:::warn
- **页面上同一时间只能有一个 Olum 应用。** 挂载新应用之前先销毁旧的（路由切换时，React 和 Vue 已经会按正确的顺序这样做）。
- **不要在宿主应用中使用 Olum 路由器。** 只挂载一个组件，让 React/Vue 的路由器来选择页面。要在 Olum 内部切换视图，请使用 state 和 `<if>`。
- **不要给嵌入的组件写 `<head>`。** 它会和宿主应用的 head 管理相冲突。
- **宿主应用不能往 Olum 的根元素里放任何东西。** 里面的一切都归 Olum 管理。
:::
