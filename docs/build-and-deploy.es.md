---
title: Compilación y despliegue
group: Compilación y SEO
order: 220
source: c290ad764090
---

Compila tu sitio para producción con un solo comando y luego sube la carpeta `dist/` a cualquier hosting estático:

```bash
npm run build
```

Compila tus componentes, lo empaqueta todo con **vite** (se instala por ti en la primera compilación) y escribe el resultado en `dist/`:

```text title="dist/"
dist/
├── index.html                  ← entry page
└── assets/
    ├── index-<hash>.js         ← your app, minified
    ├── index-<hash>.css        ← main.css + all component styles
    ├── favicon-<hash>.svg
    └── ...                     ← every file from public/assets, plus code-split chunks
```

- **Se incluye todo lo que hay en `public/`.** Los archivos que el bundler puede ver reciben nombres con hash; los archivos usados en strings en tiempo de ejecución (como `url(/assets/{type}.svg)`) se copian tal cual. Consulta [Archivos estáticos](/docs/static-assets).
- **Un error de compilación detiene la compilación.** Se muestran los errores, no se escribe nada y el comando falla (para que el CI lo detecte).

## Previsualizar la compilación {#preview-the-build}

```bash
npm start
```

Sirve `dist/` como lo haría un hosting real, para que puedas revisarlo antes de desplegar.

## Prerenderizado (recomendado) {#prerendering-recommended}

Añade un archivo `src/sitemap.js` y la compilación también guarda cada ruta como su propio archivo HTML (`dist/about/index.html`, `dist/blog/hello/index.html`, …) además de un `sitemap.xml`. Obtienes páginas que los buscadores pueden leer, un primer pintado más rápido y enlaces profundos que funcionan sin configurar el servidor. Consulta [Prerenderizado y SEO](/docs/prerendering).

## Ajustes de compilación {#build-settings}

Todos los ajustes de compilación van bajo una clave `olum` en `package.json`. Todos son opcionales:

```json title="package.json"
{
  "olum": {
    "SITE_URL": "https://example.com",
    "SSG_DELAY": 500,
    "base": "/"
  }
}
```

| Ajuste | Qué hace |
|---------|--------------|
| `SITE_URL` | Tu dominio, usado en `sitemap.xml`. Sin él, los buscadores ignoran el sitemap. |
| `SSG_DELAY` | Cuánto esperar (ms) en cada ruta antes de guardarla al prerenderizar. Por defecto `500`. Usa `0` si ninguna página carga datos en `onMount`. |
| `base` | Dónde vive el sitio. Por defecto `/`. Consulta [URL base](#base-url). |

Los dos primeros se explican en [Prerenderizado y SEO](/docs/prerendering#build-settings).

## Desplegar {#deploying}

`dist/` son archivos estáticos normales. Súbelos donde quieras: Netlify, Vercel, Cloudflare Pages, GitHub Pages, nginx, S3…

**Si prerenderizaste**, no hay nada que configurar. `/blog/hello` es una carpeta real con un `index.html`, y cualquier hosting la sirve.

**Si no prerenderizaste**, necesitas un ajuste:

:::warn
El router usa URL limpias (**modo history**), así que tu hosting debe enviar `index.html` para cada ruta que no sea un archivo real. Si no, recargar una página como `/blog/hello` muestra un 404. Los hostings suelen llamarlo "SPA fallback" o "rewrite all to /index.html".
:::

```text title="Netlify — public/_redirects"
/*  /index.html  200
```

```json title="Vercel — vercel.json"
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

El router no puede detectar que falta una reescritura. Solo cambia a URL con hash (`/#/blog/hello`) cuando el navegador no tiene History API.

:::tip
Mantener el fallback no hace daño con prerenderizado, y es útil cuando solo *algunas* rutas están prerenderizadas: esas cargan su propio archivo y el resto recurre al shell.
:::

## URL base {#base-url}

Por defecto, cada enlace de `dist/` empieza en la raíz del sitio: `/assets/index-abc123.js`. Eso es correcto cuando tu sitio está en la raíz de un dominio. Si no, define `base`:

```json title="package.json"
{
  "olum": { "base": "./" }
}
```

| `base` | Los enlaces quedan como | Úsalo para |
|--------|--------------|------------|
| ausente o `"/"` | `/assets/index-abc123.js` | un sitio en la raíz de un dominio (**por defecto**) |
| `"./"` | `./assets/index-abc123.js` | una app de escritorio (nw.js, Electron) que abre `dist/index.html` desde el disco (`file://`) |
| `"/app/"` | `/app/assets/index-abc123.js` | un sitio en una subcarpeta, p. ej. un sitio de proyecto de GitHub Pages |
| `"https://cdn.example.com/"` | `https://cdn.example.com/assets/index-abc123.js` | assets en una CDN, `index.html` en tu hosting |

- Las barras se corrigen por ti: `"app"`, `"/app"` y `"/app/"` son lo mismo. Todo lo que empieza con `.` se convierte en `"./"`.
- Un valor con espacios, comillas o `<` `>` se rechaza con un error y la compilación usa `/`.
- `BASE` (en mayúsculas) también funciona.
- Cuando la base no es `/`, la compilación muestra primero `building with base "./"`.
- Solo la usa la **compilación**. `npm run dev` siempre sirve desde `/`.

### Qué se reescribe {#what-gets-rewritten}

Vite corrige las URL que puede ver (etiquetas en `public/index.html`, assets importados). La compilación también corrige `src`, `href` y `poster` en tus plantillas cuando apuntan a un archivo real de `public/`:

```html
<img src="/assets/logo.svg" />   <!-- with base "./" the bundle says ./assets/logo.svg -->
```

Hay dos cosas que **no** se reescriben:

- **`url(...)` en el `<style>` de un componente**, y **las rutas construidas en tiempo de ejecución** (`url(/assets/{type}.svg)`). Estas se quedan como `/...`, así que para esas imágenes usa un atributo `src` en la plantilla.
- **Los enlaces del router (`to="/about"`)**: son rutas, no archivos. Usa el `root` del router (abajo).

:::warn
No uses `"./"` con [prerenderizado](/docs/prerendering). Cada página prerenderizada está en su propia carpeta, así que `./assets/…` se busca en `/blog/hello/assets/…` y falla. Usa `/` o una subcarpeta como `/app/`.
:::

### Una subcarpeta también necesita el router {#a-sub-folder-needs-the-router-too}

`base` mueve tus **archivos**, no tus **rutas**. Bajo `/app/` el navegador está en `/app/about` pero tu ruta es `/about`, así que el router generado automáticamente muestra la página 404. Escribe tu propio `src/main.js` y dale al router el mismo `root`:

```js title="src/main.js"
import Olum from "olum";
import Router from "olum-router";

import Home from "./page.js";
import About from "./about/page.js";

const routes = [
  { path: "/", comp: Home },
  { path: "/about", comp: About }
];

const router = new Router({ mode: "history", root: "/app", routes: routes });
new Olum().$("#olum-app").use(router);
```

En cuanto creas `src/main.js`, las rutas dejan de generarse a partir de tus carpetas. Tú mantienes la lista. Consulta [El router](/docs/router/router#opting-out--your-own-mainjs).
