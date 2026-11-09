---
title: Atributos
group: Sintaxis de plantillas
order: 70
source: 85c49fc9c132
---

## Atributos normales: texto con `{ }` dentro {#normal-attributes-text-with---inside}

Escribe los atributos como en HTML normal. Añade `{expr}` **dentro de las comillas** para las partes que cambian:

```html title="Component.html"
<div class="card {state.active ? 'is-active' : ''}"></div>
<a href="/users/{state.user.id}" title="Open {state.user.name}">Profile</a>
<img src="/avatars/{state.user.id}.png" alt="avatar" />
<input id="field-{state.index}" type="text" />

<!-- inline style is just text too (use CSS names like background-color) -->
<div style="color:{state.color}; background:{state.bg}; padding:8px;">box</div>
```

## Atributos de código: sin `{ }` {#code-attributes-no---needed}

Algunos atributos contienen JavaScript directamente: `when`, `each`, `key`, `on*` (eventos) y `html`. Cada uno tiene su propia página.

```html title="Component.html"
<if when="state.count > 0"> … </if>
<button onclick="inc()">+</button>
```

:::tip[La única regla que debes recordar]
¿El atributo es **código** o **texto**? El propio HTML te lo dice: `onclick=""` es código, `class=""` es texto. Los atributos de código (`when`, `each`, `key`, `on*`, `html`) reciben JavaScript directamente. Todo lo demás es texto, con `{ }` para las partes que cambian.
:::

## Atributos booleanos {#boolean-attributes}

En atributos como `disabled` o `checked`, el navegador solo comprueba si el atributo **existe**: ¡`checked="false"` sigue marcado! Por eso, cuando todo el valor es un único `{expr}`, Olum **añade** el atributo cuando es verdadero y lo **quita** cuando es falso:

```html title="Component.html"
<button disabled="{state.busy}">Save</button>
<input type="checkbox" checked="{state.on}" />
<details open="{state.expanded}">…</details>
```

Funciona con: `checked`, `disabled`, `selected`, `readonly`, `required`, `hidden`, `autofocus`, `multiple`, `open`, `loop`, `muted`, `controls`, `autoplay`, `novalidate`, `default`, `defer`, `ismap`, `reversed`.

:::note
El valor debe ser **exactamente un** `{expr}`. Algo como `checked="a {b}"` no tiene sentido en un atributo booleano.
:::

## Las URL de archivos empiezan con `/` {#file-urls-start-with}

`src`, `href` y `url()` de CSS que apuntan a archivos de `public/` deben empezar con `/`: escribe `/assets/logo.svg`, nunca `assets/logo.svg`. Si no, se rompen en producción. Consulta [Archivos estáticos](/docs/static-assets).
