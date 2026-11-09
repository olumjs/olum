---
title: Estructura de un componente
group: Primeros pasos
order: 10
source: 59f27b670f3a
---

Un componente es un archivo `.html`. Puede tener tres partes:

- `<script>`: tu JavaScript (datos y funciones)
- `<style>`: tu CSS (solo afecta a este componente)
- todo lo demás: la plantilla HTML

```html title="Counter.html"
<script>
  const state = { count: 0 };
  const inc = () => state.count++;
</script>

<style>
  .counter { font-weight: 700; }
</style>

<div class="counter">
  Count: {state.count}
  <button onclick="inc()">+</button>
</div>
```

La plantilla puede usar todo lo declarado en `<script>`: `state`, tus funciones y los nombres que tomes de [`props()`](/docs/components).

## Conviene saber {#good-to-know}

- **El nombre del archivo es el nombre del componente.** `CounterCard.html` se convierte en el componente `CounterCard`. Usa PascalCase (cada palabra empieza con mayúscula).
- **Las etiquetas de componente también van en PascalCase**: `<CounterCard />`. Esa mayúscula es como Olum distingue tus componentes de las etiquetas HTML normales como `<div>`.
- **`<script>` y `<style>` son opcionales.** Un archivo con solo HTML es un componente válido.
- **`<style>` tiene alcance** automáticamente. Consulta [CSS con alcance](/docs/scoped-css).
- **Cada componente va envuelto en un `<div>`** que añade Olum. Ese `<div>` es el elemento [`host`](/docs/lifecycle). Tenlo en cuenta cuando escribas CSS como `.parent > .child` alrededor de un componente.
- **Los archivos de página también pueden tener un `<head>`.** Solo los archivos de ruta (`page.html` y `not-found.html`) pueden definir el título de la página, la descripción y otras etiquetas meta. En cualquier otro componente, `<head>` se ignora y la compilación muestra un aviso. Consulta [Metadatos de página y SEO](/docs/metadata).

```html title="src/blog/[slug]/page.html"
<head>
  <title>{post.title} — My Blog</title>
  <meta name="description" content="{post.excerpt}" />
</head>

<script>
  import { params } from "olum";
  const { slug } = params();
  const post = getPost(slug);
</script>

<article><h1>{post.title}</h1></article>
```
