---
title: Prerenderizado y SEO
group: Compilación y SEO
order: 240
source: c22cfc43c2a1
---

Las apps de Olum se ejecutan en el navegador. Eso es genial para los usuarios, pero un buscador o una vista previa de enlace que lea `dist/blog/hello/index.html` solo encontraría un shell vacío.

El **prerenderizado** lo soluciona. Durante la compilación, Olum abre cada página de tu app en un navegador real y guarda el HTML terminado como el archivo propio de esa página:

```text
npm run build
      ↓
compile + bundle
      ↓
collect every route
      ↓
open YOUR app in a real browser, once per route
      ↓
save the rendered HTML as that route's index.html
      ↓
deploy dist/ to any static host
```

Obtienes un primer pintado rápido, enlaces profundos que funcionan y páginas que los rastreadores pueden leer. En cuanto la página carga en un navegador, vuelve a ser una app de Olum normal.

## Activarlo {#turn-it-on}

Crea **`src/sitemap.js`**. Ese archivo es el interruptor: sin él, la compilación no prerenderiza.

```js title="src/sitemap.js"
import { getPosts } from "./api.js";

export default async function () {
  const posts = await getPosts();
  return posts.map((post) => `/blog/${post.slug}`);
}
```

- Exporta una **función** que devuelve un **array de URL**. Puede ser `async`.
- Es código normal: imports, `fetch`, un cliente de base de datos, cualquier cosa que Node pueda ejecutar.
- Solo listas las **URL reales de las rutas dinámicas** (como `/blog/hello` para `blog/[slug]`). Las rutas normales se encuentran automáticamente a partir de tus archivos `page.html`.

:::tip
`src/sitemap.js` no es una ruta y nunca se envía al navegador. Solo se ejecuta durante la compilación.
:::

## Qué páginas se prerenderizan {#which-pages-get-prerendered}

Tus rutas normales **más** lo que devuelva `sitemap.js`, sin duplicados:

```text
from your folders           from sitemap.js
  /                           /blog/hello
  /about                      /blog/world
  /blog                       /match/liverpool
  /blog/:slug        ✗ dropped (a pattern, not a URL)
  /match/:slug       ✗ dropped
        └────────────┬────────────┘
                     ▼
  /  /about  /blog  /blog/hello  /blog/world  /match/liverpool
```

Una URL de `sitemap.js` que ninguna ruta puede mostrar se omite.

## El resultado {#the-output}

Cada ruta se convierte en una **carpeta con su propio `index.html`**:

```text title="dist/"
dist/
├── index.html                  ← "/"
├── sitemap.xml
├── about/
│   └── index.html              ← "/about"
├── blog/
│   ├── index.html              ← "/blog"
│   ├── hello/index.html        ← "/blog/hello"
│   └── world/index.html
├── match/
│   └── liverpool/index.html
└── assets/
    └── …
```

Una carpeta padre solo recibe un archivo si es una ruta en sí misma. Si nada define `/match`, no hay `dist/match/index.html`.

Cada archivo contiene la página completa, incluido [el `<head>` de tu página](/docs/metadata):

```html title="dist/blog/hello/index.html"
<!doctype html>
<html lang="en" data-olum>
  <head>
    <title>Hello — My Blog</title>
    <meta name="description" content="…" />
    …
  </head>
  <body>
    <div id="olum-app"><div data-olum="…"><article><h1>Hello</h1>…</article></div></div>
    <script type="module" src="/assets/index-<hash>.js"></script>
  </body>
</html>
```

La compilación muestra lo que escribió y cuánto ocupa cada página:

```text
SSG: 6 route(s) to prerender
 ✓ 1/6  /about
 ✓ 2/6  /blog
 …
SSG: prerendered 6 page(s)
SSG: sitemap.xml lists 6 URL(s)

/
├── about                   1.4 kB
├── blog                    1.1 kB
│   ├── hello               2.3 kB
│   └── world               2.1 kB
└── match
    └── liverpool           1.8 kB
```

## No hace falta reescritura en el servidor {#no-server-rewrite-needed}

Sin prerenderizado, tu hosting debe responder a `/blog/hello` con `/index.html` (consulta [Compilación y despliegue](/docs/build-and-deploy#deploying)). Con prerenderizado, `/blog/hello` **es un archivo real**, así que funciona en cualquier hosting estático **sin configurar nada**.

:::tip
Mantén el fallback de todos modos si algunas rutas **no** están prerenderizadas (por ejemplo, un `/blog/:slug` que dejaste fuera de `sitemap.js`). Las rutas prerenderizadas cargan su propio archivo; el resto recurre al shell.
:::

## Páginas que cargan datos {#pages-that-load-data}

Una página que pide datos en `onMount` está **vacía al principio**:

```html title="src/match/[slug]/page.html"
<head>
  <title>{slug} vs {state.post?.opponent}</title>
</head>

<script>
  import { params, onMount } from "olum";
  import { getMatch } from "../../api.js";

  const { slug } = params();
  const state = { post: null };

  onMount(async () => {
    state.post = await getMatch(slug);
  });
</script>

<h1>{slug} vs {state.post?.opponent}</h1>
```

La compilación guarda una página en cuanto aparece algo en pantalla, que es **antes** de que termine el `await`. Sin una espera, publicarías el estado de carga. `SSG_DELAY` (por defecto `500` ms) le da a cada página tiempo para terminar:

```json title="package.json"
{
  "olum": { "SSG_DELAY": 500 }
}
```

```html title="dist/match/liverpool/index.html"
<title>liverpool vs barcelona</title>
…
<h1>liverpool vs barcelona</h1>
```

El `<head>` se actualiza con la página, así que el archivo recibe tanto el contenido como los metadatos.

### Elegir un valor {#picking-a-value}

Empieza con 200–500 ms. La compilación te dice lo que cuesta:

```text
SSG: waiting 500ms after each route (+46.5s to this build)
```

Después **revisa un archivo**, porque una espera demasiado corta falla en silencio:

```bash
grep -o "<title[^>]*>[^<]*</title>" dist/match/liverpool/index.html
```

¿Sigue mostrando el estado de carga? Súbela. ¿La compilación es demasiado lenta? Bájala y vuelve a revisar.

:::warn
- **Demasiado corta:** la compilación escribe una página a medio terminar y aun así muestra ✓. Nadie lo nota hasta que cae el tráfico de búsqueda.
- **Demasiado larga:** la pagas en cada ruta (500 ms × 93 rutas = 46 s por compilación).
- Es una espera fija, no una comprobación. Una API lenta o una máquina de CI ocupada pueden no llegar con un valor que funciona en tu portátil. Si puedes, mantén rápidos y locales los datos que necesitan las páginas prerenderizadas.
:::

## sitemap.xml {#sitemapxml}

Cada ruta que se guardó aparece en `dist/sitemap.xml` con la fecha de hoy como `<lastmod>`. Una ruta que no se pudo renderizar se deja fuera (un enlace roto perjudicaría tu posicionamiento).

Los buscadores necesitan URL completas en un sitemap, así que indícale tu dominio a la compilación con `SITE_URL`. Sin él, la compilación avisa y escribe rutas relativas.

## Ajustes de compilación {#build-settings}

Todos bajo la clave `olum` en `package.json`. Ninguno es obligatorio; la compilación te dice lo que te falta.

```json title="package.json"
{
  "olum": {
    "SITE_URL": "https://example.com",
    "SSG_DELAY": 500,
    "base": "/"
  }
}
```

### `SITE_URL` {#site_url}

Tu dominio, que se pone delante de cada URL en `sitemap.xml`. Los buscadores ignoran ahí las URL relativas, y la compilación no puede adivinar tu dominio.

| Valor | Resultado |
|--------|--------|
| `"https://example.com"` | `<loc>https://example.com/blog/hello</loc>` |
| ausente | un aviso, y valores `<loc>` relativos que los rastreadores ignoran |

La barra final se quita por ti.

### `SSG_DELAY` {#ssg_delay}

Espera extra, en **milisegundos por ruta**, después de que aparece la página y antes de guardarla. Útil para páginas que [cargan datos](#pages-that-load-data).

| Valor | Resultado |
|--------|--------|
| ausente | 500 ms (**por defecto**) |
| `0` | sin espera |
| `250` | cada ruta espera 250 ms |
| no es un número (`true`, `"soon"`, `-1`) | un mensaje de error, y luego se usa 500 (la compilación no falla) |

Pon `0` cuando todas las páginas ya tienen sus datos: la espera solo es tiempo de compilación perdido, en cada ruta.

### `base` {#base}

Dónde vive el sitio, `/` por defecto. Consulta [URL base](/docs/build-and-deploy#base-url).

:::warn
El prerenderizado solo funciona con `"/"` o una subcarpeta como `"/app/"`. Una base relativa (`"./"`) lo rompe: cada página está en su propia carpeta, así que `./assets/…` se busca en `/blog/hello/assets/…` y falla.
:::

## En el navegador {#in-the-browser}

El HTML prerenderizado es lo que ven los rastreadores, las vistas previas de enlaces y el primer pintado. Cuando la app arranca, renderiza en `#olum-app` como siempre y toma el control.

:::note
El HTML prerenderizado se **reemplaza**, no se reutiliza ("hydrated"). Todo lo que deba sobrevivir en la app en ejecución pertenece a `state`, no al HTML guardado.
:::

## Previsualizar {#preview}

```bash
npm start
```

Con `src/sitemap.js`, `/blog/hello` sirve `dist/blog/hello/index.html`, así que ves la página prerenderizada. Sin él, cada ruta sirve el `index.html` raíz, como lo haría un hosting real.

## La primera compilación es más lenta {#the-first-build-is-slower}

El prerenderizado necesita un navegador:

- **vite** se instala en la primera compilación (cualquier compilación).
- **puppeteer** se instala en la primera compilación que prerenderiza, y descarga Chrome (~150 MB) una vez.

Sin `sitemap.js`, no hay descarga de puppeteer.

## Conviene saber {#good-to-know}

- **Una página que falla se informa, pero no es fatal.** La compilación muestra `✗ /blog/hello — failed to render …` y continúa. Esa ruta se queda con el shell simple y se deja fuera de `sitemap.xml`.
- **Una página se considera lista** cuando el router ha puesto algo en `#olum-app` (máximo 15 s). Eso es antes de que termine un fetch en `onMount`, de ahí `SSG_DELAY`.
- **Solo se captura el trabajo hecho al cargar.** Los datos cargados con un clic, un temporizador más largo que la espera o un observador de scroll no estarán en el archivo, que suele ser lo que quieres.
- **`/` se guarda al final** a propósito: el servidor local de previsualización usa `dist/index.html` para las URL desconocidas, así que tiene que seguir siendo un shell vacío hasta que terminen las demás rutas.
- **Los errores de compilación hacen fallar toda la compilación**, así que el CI los detecta antes de desplegar.

## Ver también {#see-also}

- [Metadatos de página y SEO](/docs/metadata): el `<head>` que cada página escribe en su archivo.
- [Compilación y despliegue](/docs/build-and-deploy): el resultado de la compilación y la configuración del hosting.
- [Convenciones de archivos](/docs/router/file-conventions): cómo las carpetas se convierten en rutas.
