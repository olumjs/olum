---
title: Integrar en React y Vue
group: Avanzado
order: 260
source: 391c7fa601da
---

Una app de Olum puede vivir dentro de una app de React o Vue. Móntala como siempre y llama a `app.destroy()` cuando la app anfitriona la elimine.

:::warn[En mantenimiento]
La integración todavía está en desarrollo. `app.destroy()` existe, pero esta API y estas reglas pueden cambiar. No dependas de ella en producción todavía.
:::

```js title="main.js"
import Olum from "olum";
import App from "./App.js";

const app = new Olum();
app.$("#olum-app").use(App); // mount
app.destroy();               // unmount and clean up
```

`$()` acepta un selector CSS **o un elemento**, así que puedes pasarle directamente una ref de React o de Vue.

## Qué hace `destroy()` {#what-destroy-does}

- Ejecuta la limpieza de [`onMount`](/docs/lifecycle) de cada componente (primero los hijos).
- Quita el listener de Olum en `window` y descarta cualquier actualización pendiente.
- Deja `document.head` como estaba antes de que Olum lo cambiara (consulta [Metadatos de página](/docs/metadata)).
- Vacía el elemento raíz.

Llamarlo dos veces es seguro, y llamarlo antes de `use()` no hace nada. Las etiquetas `<style>` de los componentes se quedan en `<head>` (cada una se añade una sola vez, así que un montaje posterior sigue teniendo su CSS).

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

En desarrollo, el StrictMode de React monta, destruye y vuelve a montar. No pasa nada: cada `new Olum()` empieza de cero.

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

## Reglas {#rules}

:::warn
- **Una sola app de Olum en la página a la vez.** Destruye la anterior antes de montar una nueva (React y Vue ya lo hacen en el orden correcto cuando cambia la ruta).
- **No uses el router de Olum dentro de una app anfitriona.** Monta un componente y deja que el router de React/Vue elija la página. Para cambiar de vista dentro de Olum, usa state y `<if>`.
- **No le pongas `<head>` a un componente integrado.** Chocaría con la gestión del head de la app anfitriona.
- **La app anfitriona no debe meter nada dentro del elemento raíz de Olum.** Todo lo que hay dentro es de Olum.
:::
