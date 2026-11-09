---
title: Metadatos de página y SEO
group: Compilación y SEO
order: 230
source: 99b6016ebaac
---

Una página puede definir su propio `<head>` (título, descripción, tarjetas sociales, enlace canonical, JSON-LD) directamente dentro de su `page.html`:

```html title="src/blog/[slug]/page.html"
<head>
  <title>{post.title} — My Blog</title>
  <meta name="description" content="{post.excerpt}" />
  <link rel="canonical" href="https://example.com/blog/{slug}" />

  <meta property="og:title" content="{post.title}" />
  <meta property="og:image" content="{post.cover}" />
  <meta name="twitter:card" content="summary_large_image" />
</head>

<script>
  import { params } from "olum";
  import { getPost } from "../../api.js";

  const { slug } = params();
  const post = getPost(slug);
</script>

<article>
  <h1>{post.title}</h1>
  {post.body}
</article>
```

`{expr}` en el `<head>` puede usar cualquier cosa del `<script>` (`state`, `params()`, `props()`, tus constantes), igual que la plantilla.

## Solo las páginas pueden tener `<head>` {#only-pages-can-have-a-head}

| Archivo | ¿Se permite `<head>`? |
|------|-------------------|
| `page.html` | ✅ sí |
| `not-found.html` | ✅ sí |
| cualquier otro componente | ❌ se ignora, con un aviso de compilación que te dice adónde moverlo |

:::warn
- Cierra la etiqueta: `<head> … </head>`. Un `<head>` sin cerrar se ignora (con un aviso).
- Solo se usa el **primer** `<head>` de un archivo.
:::

## Cómo se combina con `public/index.html` {#how-it-combines-with-publicindexhtml}

`public/index.html` es el punto de partida. Las etiquetas de tu página se fusionan con él:

- Si tu página tiene una etiqueta del **mismo tipo**, **reemplaza** a la original, en el mismo sitio.
- Si no, tu etiqueta se **añade** al final.
- Todo lo demás se queda como estaba, incluidas las etiquetas `<style>` de Olum y las etiquetas `<script>` / `<link>` del bundler.

Qué cuenta como "el mismo tipo":

| Etiqueta | Es del mismo tipo cuando tiene el mismo… |
|-----|------------------------|
| `<title>`, `<base>` | (solo una por página) |
| `<meta charset>` | `charset` |
| `<meta name>`, `<meta property>`, `<meta http-equiv>`, `<meta itemprop>` | name / property |
| `<link rel="canonical" \| "icon" \| "apple-touch-icon" \| "manifest" \| "amphtml">` | `rel` (solo una por página) |
| `<link rel="stylesheet" \| "preload" \| "preconnect" \| …>` | `rel` **y** `href`, así que una página **añade** una hoja de estilos en lugar de reemplazar la tuya |
| `<script type="application/ld+json">` | una por página (dale un `id` a cada una si necesitas varias) |

**Ejemplo.** El shell tiene un `<title>`, `charset`, `description`, `viewport` y una hoja de estilos. La página declara un `<title>`, una `description` y `og:title`. Resultado: el título y la descripción se **reemplazan**, `og:title` se **añade**, y `charset`, `viewport` y la hoja de estilos **no se tocan**.

`not-found.html` funciona igual, así que tu página 404 puede definir su propio `<title>` y `robots`.

:::tip
Pon las etiquetas de todo el sitio (`charset`, `viewport`, favicon, hoja de estilos, `theme-color`) en `public/index.html`. Pon solo las etiquetas propias de cada página en el `<head>` de esa página.
:::

### Cambiar de página siempre queda limpio {#changing-pages-is-always-clean}

Cada vez que se carga una ruta, Olum **primero restablece el head a `public/index.html`** y luego aplica las etiquetas de la nueva página. Así, un `og:image` de la página anterior nunca se cuela en la siguiente. Una página sin `<head>` obtiene exactamente el head original.

:::note
Las etiquetas reemplazadas se guardan en un `<template data-olum-head>` oculto (así es como una página [prerenderizada](/docs/prerendering) puede restaurarlas), y las etiquetas que añade una página llevan un atributo `data-olum-head`. Ambas cosas son inofensivas; ignóralas.
:::

## Datos estructurados (JSON-LD) {#structured-data-json-ld}

Dentro de `<script type="application/ld+json">`, un `{` normal es JSON normal. `{expr}` solo funciona **dentro de un string entre comillas dobles**, y el valor se inserta **sin escapar** (sin escape HTML) para que el JSON siga siendo válido:

```html title="src/match/[slug]/page.html"
<head>
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "SportsEvent",
      "name": "{match.name}",
      "url": "https://example.com/match/{slug}",
      "startDate": "{match.kickoff}"
    }
  </script>
</head>
```

:::warn
Como el valor se inserta sin escapar, un `"` o `\` en él rompe el JSON. Para texto que envía el usuario, usa `{JSON.stringify(match.name)}` **sin** las comillas alrededor.
:::

## Escapado en todo lo demás {#escaping-everywhere-else}

Fuera de JSON-LD, `{expr}` se **escapa como HTML**, igual que en la plantilla, así que una comilla en una descripción no puede romper la etiqueta.

| Escribes | Obtienes |
|-----------|---------|
| `` ` `` | un acento grave (se escapa por ti) |
| `\` | una barra invertida (se escapa por ti) |
| `${x}` | `$` seguido del valor de `{x}` (el `$` es solo texto) |

## Se actualiza con tu state {#it-updates-with-your-state}

El head se vuelve a renderizar con la página, en desarrollo **y** en producción:

```html title="src/blog/[slug]/page.html"
<head>
  <title>{state.post.title} — My Blog</title>
</head>

<script>
  import { onMount } from "olum";
  const state = { post: { title: "Loading…" } };

  onMount(async () => {
    state.post = await fetchPost();   // the tab title updates
  });
</script>
```

Solo la **página** controla el head. Los componentes hijos nunca lo tocan, y el head solo se vuelve a aplicar cuando su resultado cambió de verdad.

:::warn
Las vistas previas de redes sociales (Twitter, Slack, Facebook, LinkedIn) no ejecutan JavaScript; solo leen el archivo HTML. Para que vean tus etiquetas, la página debe estar [prerenderizada](/docs/prerendering). Si el título viene de un `await`, la compilación también debe esperarlo: para eso existe `SSG_DELAY`.
:::

## Dónde se aplica {#where-it-applies}

- **`npm run dev`**: se aplica cuando se carga una ruta y en cada nuevo renderizado.
- **`npm run build` con prerenderizado**: se escribe en el `index.html` de cada ruta, así que los rastreadores lo leen sin JavaScript.
- **`npm run build` sin prerenderizado**: se aplica solo en el navegador. Las herramientas que no ejecutan JavaScript ven el head de `public/index.html`.
