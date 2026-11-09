---
title: Hooks del ciclo de vida
group: Componentes
order: 180
source: 820ee91bfc75
---

`onMount` ejecuta tu código cuando el componente **aparece en la página**. Si devuelves una función, se ejecuta cuando el componente **se elimina** (la "limpieza").

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

La limpieza se ejecuta cuando el componente se elimina (un `<if>` pasa a falso, se borra un elemento de una lista con key, cambia la ruta) y cuando toda la app se cierra con [`app.destroy()`](/docs/embedding) (la integración está en mantenimiento).

:::warn
Llama a `onMount` **una sola vez** por componente. Una segunda llamada se ignora. Pon toda tu inicialización en un único callback y devuelve una sola limpieza.
:::

## Cargar datos {#loading-data}

El callback puede ser `async`. Es el lugar habitual para pedir datos:

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

## Temporizadores y listeners globales {#timers-and-global-listeners}

Inicia temporizadores, bucles de `requestAnimationFrame` y listeners de `window` / `document` en `onMount`, y detenlos en la limpieza:

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

`host` es el propio elemento envoltorio de este componente. No hace falta importarlo. Usa `host.querySelector(…)` en lugar de `document.querySelector(…)`, que podría encontrar un elemento de otra copia del componente o de otra parte de la página.

Está listo en `onMount` y en los manejadores de eventos (todo lo que se ejecuta después de que el componente está en la página), pero **no** en el nivel superior de `<script>`.

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

El mismo patrón de iniciar/detener sirve para:

- un bucle de dibujo en `<canvas>`
- un `<video>` que sigues con `requestAnimationFrame` (`onplay`, `onpause` y `onloadedmetadata` funcionan como atributos normales; solo necesitas `onMount` para el bucle y para cosas como `video.currentTime`)
- eventos que no se pueden escribir como atributos, como `copy` o `paste` (consulta [Eventos](/docs/events#events-you-must-add-by-hand))

Ejemplos: [`/forms/host-element`](/forms/host-element) (canvas), [`/forms/dimensions`](/forms/dimensions) (ResizeObserver), [`/forms/media-elements`](/forms/media-elements) (reproductor de vídeo).
