---
title: Embedding in React & Vue
group: Advanced
order: 260
---

An Olum app can live inside a React or Vue app. Mount it as usual, and call `app.destroy()` when the host app removes it.

:::warn[Under maintenance]
Embedding is still being worked on. `app.destroy()` exists, but this API and these rules may change. Don't rely on it in production yet.
:::

```js title="main.js"
import Olum from "olum";
import App from "./App.js";

const app = new Olum();
app.$("#olum-app").use(App); // mount
app.destroy();               // unmount and clean up
```

`$()` takes a CSS selector **or an element**, so you can pass a React or Vue ref directly.

## What `destroy()` does

- Runs every component's [`onMount`](/docs/lifecycle) cleanup (children first).
- Removes Olum's `window` listener and drops any pending update.
- Puts `document.head` back the way it was before Olum changed it (see [Page Metadata](/docs/metadata)).
- Empties the root element.

Calling it twice is safe, and calling it before `use()` does nothing. Component `<style>` tags stay in `<head>` (each is added only once, so a later mount still has its CSS).

## React

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

In development, React StrictMode mounts, destroys and mounts again. That's fine: each `new Olum()` starts clean.

## Vue

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

## Rules

:::warn
- **One Olum app on the page at a time.** Destroy the old one before mounting a new one (React and Vue already do this in the right order when the route changes).
- **Don't use the Olum router inside a host app.** Mount one component and let the React/Vue router pick the page. To switch views inside Olum, use state and `<if>`.
- **Don't give an embedded component a `<head>`.** It would fight with the host's head management.
- **The host must not put anything inside the Olum root element.** Olum owns everything in it.
:::
