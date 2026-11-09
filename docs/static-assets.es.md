---
title: Archivos estáticos
group: Primeros pasos
order: 20
source: 2c152bc5a54e
---

Pon imágenes, iconos, fuentes y descargas en la carpeta `public/`. Todo lo que contiene se sirve desde la **raíz del sitio**: `public/assets/logo.svg` está disponible en `/assets/logo.svg`.

## Empieza siempre la URL con `/` {#always-start-the-url-with}

```html title="Component.html"
<!-- ✓ works on every page, in dev and in production -->
<img src="/assets/logo.svg" />

<style>
  .icon { background: url(/assets/folder.svg) no-repeat; }
</style>

<!-- ✗ breaks in production -->
<img src="assets/logo.svg" />
```

**Por qué:** Olum añade tus plantillas y estilos a la página mientras se ejecuta, así que el navegador resuelve una URL relativa respecto a la página actual. En `/shop/cart`, `assets/logo.svg` se convierte en `/shop/assets/logo.svg`, que no existe.

:::warn
El servidor de desarrollo oculta este error: prueba rutas más cortas hasta encontrar el archivo, así que una URL relativa *parece* funcionar mientras desarrollas. Los hostings reales no hacen eso. Escribe siempre `/assets/...`.
:::

## Rutas dinámicas {#dynamic-paths}

Una URL es solo un string, así que puedes usar `{expr}` dentro. Mantén la `/` inicial:

```html title="File.html"
<span style="background-image: url(/assets/{type}.svg)">{name}</span>
```

La [compilación](/docs/build-and-deploy) copia todos los archivos de `public/` a la salida, así que los archivos usados de esta forma siempre están ahí.

## ¿El sitio no está en la raíz del dominio? {#site-not-at-the-domain-root}

Sigue escribiendo `/assets/...`. Si defines una [`base`](/docs/build-and-deploy#base-url) distinta de `/` (una subcarpeta, una CDN, una app de escritorio con `file://`), la compilación corrige por ti los valores de `src`, `href` y `poster` que apuntan a un archivo real de `public/`.

:::warn
Hay dos cosas que **no** se corrigen y se quedan como `/...`: `url(...)` dentro del `<style>` de un componente, y las rutas construidas en tiempo de ejecución como `url(/assets/{type}.svg)`. Con una base personalizada no encontrarán el archivo. Para esas imágenes, usa un atributo `src` en la plantilla.
:::

:::note
`public/index.html` (el shell de tu app) y `public/main.css` (tu CSS global) los procesa la compilación. Todo lo demás de `public/` se publica tal cual, así que no dejes archivos de prueba ahí.
:::
