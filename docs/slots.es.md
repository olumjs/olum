---
title: Slots
group: Componentes
order: 170
source: 236ef6cfd7c4
---

Todo lo que pongas **entre** las etiquetas de un componente le llega al hijo como `children`:

```html title="Parent.html"
<CounterCard title="Score">
  <em>passed from the parent</em>
</CounterCard>
```

```html title="CounterCard.html"
<script>
  import { props } from "olum";
  const { children } = props();
</script>

<div class="slot">{children}</div>
```

Como las demás props, `children` está [siempre actualizado](/docs/components#reading-props-in-the-child): si el padre pasa otro contenido más tarde, `{children}` muestra el nuevo. `{props().children}` también funciona.

## Contenido por defecto {#fallback-content}

`children` está vacío cuando no se pasó nada. Usa `<if>` / `<else>` para mostrar un contenido por defecto:

```html title="Box.html"
<script>
  import { props } from "olum";
  const { children } = props();
</script>

<div class="box">
  <if when="children">{children}</if>
  <else><em>no content was provided</em></else>
</div>
```

```html title="Parent.html"
<Box><p>This is a box.</p></Box>   <!-- shows the paragraph -->
<Box />                            <!-- shows the fallback -->
```

:::note
El contenido de un slot se inserta como **HTML real**, no como texto escapado, porque viene de tu propia plantilla. Nunca pases texto que no sea de confianza a través de un slot. Consulta [Escapado y seguridad](/docs/security).
:::
