---
title: Embedding in React & Vue
group: Advanced
order: 195
---

:::warn[Under maintenance]
Embedding is still being worked on. `app.destroy()` exists, but the API and the rules on this page can change. Do not rely on it in production yet.
:::

An Olum app can live inside a React or Vue app. You mount it the usual way, and you call `app.destroy()` when the host removes it.

```js title="main.js"
import Olum from "olum";
import App from "./App.js";

const app = new Olum();
app.$("#olum-app").use(App); // mount — unchanged
app.destroy();               // unmount and clean up
```

`$()` takes a CSS selector **or the element itself**, so you can pass a React or Vue ref directly.

## What `destroy()` does

`destroy()` is the reverse of `use()`:

- Runs every mounted component's [`onMount`](/docs/lifecycle) cleanup, children before parents.
- Removes the runtime's `window` listener and drops any re-render that is still queued.
- Puts `document.head` back the way it was before the Olum page changed it (see [Page metadata](/docs/metadata)).
- Empties the root element.

It is safe to call more than once, and calling it before `use()` does nothing. Component `<style>` tags stay in `<head>`: each one is injected only once, when its module loads, so a later mount still has its CSS.

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

React StrictMode mounts, destroys, and mounts again in development. That works: each `new Olum()` starts clean.

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
- **One Olum app on the page at a time.** The runtime keeps one global app state. Destroy the old app before you mount a new one (React and Vue already do this in the right order when a route changes).
- **Do not use the Olum router inside a host app.** Mount a single component and let the React/Vue router choose the page. To switch views inside the Olum app, use state and `<if>`.
- **Do not give an embedded component a `<head>`.** It would compete with the host's head management.
- **The host must not render children into the Olum root.** Olum owns everything inside that element.
:::
