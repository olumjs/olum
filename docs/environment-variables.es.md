---
title: Variables de entorno
group: Compilación y SEO
order: 225
source: 1efeaafd7814
---

Pon los ajustes que cambian entre tu ordenador y el sitio publicado, como la dirección de una API, en archivos `.env` y léelos en tu código como `process.env.NAME`.

```text title=".env.development"
API_URL="http://localhost:3000"
```

```text title=".env.production"
API_URL="https://api.example.com"
```

```html title="src/page.html"
<script>
  import { onMount } from "olum";
  const state = { posts: [] };

  onMount(async () => {
    const res = await fetch(process.env.API_URL + "/posts");
    state.posts = await res.json();
  });
</script>
```

`npm run dev` habla con `http://localhost:3000`, y el sitio que compilas habla con `https://api.example.com`. Sin cambiar el código.

## Qué archivo se usa {#which-file-is-used}

Los archivos van en la raíz del proyecto, junto a `package.json`:

| Comando | Lee |
|---------|-----|
| `npm run dev` | `.env`, luego `.env.development` |
| `npm run build` | `.env`, luego `.env.production` |

- `.env` es opcional y guarda los valores que comparten ambos. Cuando un nombre está en los dos archivos, gana el segundo.
- Si solo tienes un `.env`, se usa en dev **y** en la compilación.
- Sin ningún archivo → `process.env` es un objeto vacío.

## Formato del archivo {#file-format}

```text title=".env"
# a line starting with # is a comment
API_URL=https://api.example.com
export SITE_NAME="My Shop"    # quotes and `export` are optional
GREETING="Hello\nWorld"       # \n is a new line, inside double quotes only
```

**Todos los valores son strings.** Conviértelos tú mismo:

```js
if (process.env.DEBUG) {}                        // ✗  DEBUG=false is the string "false", which is truthy
if (process.env.DEBUG === "true") {}             // ✓
const pageSize = Number(process.env.PAGE_SIZE);  // ✓  "20" → 20
```

Usa nombres hechos de letras, dígitos y `_` (`API_URL`, `apiUrl`).

## Todo esto es público {#everything-here-is-public}

:::danger[Nunca pongas secretos en estos archivos]
Estos valores se **incluyen en la compilación**: se escriben en `dist/index.html` y en el JS empaquetado, y el navegador de cada visitante los descarga, donde cualquiera puede leerlos. Direcciones e interruptores de funciones están bien. Las **credenciales críticas** (claves secretas de API, contraseñas de bases de datos, tokens privados) deben estar en un **backend separado**: tu app llama a ese backend, y solo el backend usa el secreto.
:::

## Cómo funciona {#how-it-works}

- **En dev**, tus valores se añaden a `index.html` como un pequeño script que define `process.env`, antes de que se ejecute tu código. Los scripts inline de `public/index.html` también pueden leerlo.
- **En una compilación**, cada `process.env.NAME` que escribes completo se reemplaza por su valor en el JS empaquetado. El código detrás de una comprobación que nunca puede cumplirse (`if (process.env.DEBUG === "true")` con `DEBUG=false`) se elimina del bundle.
- `process.env[name]` y los nombres que no están en el archivo siguen funcionando en una compilación: se leen del mismo script en `dist/index.html`.

## Bueno saber {#good-to-know}

- **Reinicia `npm run dev` después de editar un archivo `.env`.** El servidor de desarrollo los lee al arrancar.
- `process.env.NODE_ENV` no es uno de tus valores: una compilación lo convierte en `"production"`, y en dev es `undefined` salvo que lo añadas a `.env.development`.
- No crees `process` tú mismo en `public/index.html` (`const process = { env: {} }`). Oculta los valores que añade Olum, así que `process.env` se lee vacío en dev.
