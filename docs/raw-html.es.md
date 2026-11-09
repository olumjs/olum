---
title: HTML sin escapar
group: Sintaxis de plantillas
order: 140
source: 484fb799da47
---

`{expr}` siempre muestra texto, nunca HTML. Cuando de verdad necesitas insertar HTML, hay dos formas. **Úsalas solo con HTML en el que confíes** (consulta [Escapado y seguridad](/docs/security)).

## `html="expr"`: rellenar un elemento {#htmlexpr-fill-an-element}

El contenido del elemento pasa a ser ese HTML (los hijos que tenga se reemplazan):

```html title="Component.html"
<div html="state.articleHtml"></div>
<span html="state.richText"></span>
```

## `olum.html(value)`: en línea {#olumhtmlvalue-inline}

Úsalo dentro de `{ }` cuando el HTML está en medio de otro texto:

```html title="Component.html"
<p>Intro: {olum.html(state.snippetHtml)} — end.</p>
```

Las dos formas son fáciles de buscar en tu código, así que es fácil revisar dónde se usa HTML sin escapar. Todo lo demás se escapa.
