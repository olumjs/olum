---
title: Interpolación de texto
group: Reactividad
order: 40
source: a6941c575829
---

Muestra un valor de JavaScript en tu HTML envolviéndolo en `{ }`. Siempre se muestra como texto seguro:

```html title="Component.html"
<p>Hello {state.user.name}</p>
<p>Total: {state.items.length} items</p>
<p>{state.count > 0 ? 'positive' : 'zero'}</p>
```

## Conviene saber {#good-to-know}

- El valor se **escapa como HTML**, así que un texto como `<b>` se muestra como texto, no como HTML. Esto te protege de XSS. Para mostrar HTML real, consulta [HTML sin escapar](/docs/raw-html).
- `null` y `undefined` no muestran nada.
- **No hay forma de escapar `{`** en el texto. Cualquier `{…}` se trata como código. Para mostrar un `{` literal, escribe `{String.fromCharCode(123)}` o pon `"{"` en una `const` y muestra esa.
