---
title: CSS con alcance
group: Componentes
order: 190
source: 57a6aaecd0a7
---

El CSS del `<style>` de un componente solo afecta a **ese componente**. Solo escribe CSS normal:

```html title="Component.html"
<style>
  .title { color: #4f46e5; }   /* won't affect other components */
</style>
<h1 class="title">Hello</h1>
```

**Cómo funciona:** Olum añade un atributo único a los elementos del componente y lo agrega a cada selector (`p:hover` se convierte en `p[data-o-x]:hover`). Los componentes hijos tienen su propio atributo, así que ni siquiera `.card p` le dará estilo a un `<p>` dentro de un componente anidado.

## Estilos globales {#global-styles}

Los selectores que empiezan por `:root`, `html` o `body` **no** tienen alcance. Úsalos cuando un componente necesite CSS global:

```html title="Component.html"
<style>
  :root { --brand: #25c97e; }        /* a global CSS variable */
  body { overflow: hidden; }          /* global while this style is on the page */
  .panel { color: var(--brand); }     /* scoped as usual */
</style>
```

Para estilos de toda la app que no pertenecen a ningún componente, usa `public/main.css`.

## Conviene saber {#good-to-know}

- **Los `@keyframes` son por componente.** `@keyframes fade` se renombra a `fade-<ComponentName>` (y tus `animation` / `animation-name` se actualizan para coincidir), así que dos componentes pueden tener cada uno un `fade` sin chocar.
- **`@media`, `@supports`, `@layer`, `@container`**: las reglas de dentro tienen alcance como siempre.
- **`@font-face`** se deja tal cual.
- **Los comentarios CSS** se eliminan.
- Los estilos se añaden **una vez por componente** como un `<style id="olum-style-<Name>">` en `<head>`, la primera vez que aparece. Todas las copias del componente lo comparten.
- `url(...)` debe empezar con `/` (`url(/assets/x.svg)`), si no, se rompe en páginas anidadas. Consulta [Archivos estáticos](/docs/static-assets).
- No hay selector `:host` para el `<div>` que envuelve al componente. Da estilo directamente a tus propios elementos.
