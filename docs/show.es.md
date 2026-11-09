---
title: Mostrar / ocultar
group: Sintaxis de plantillas
order: 90
source: b55bd0de179f
---

Como `<if>`, pero el contenido **se queda en la página** y solo se oculta:

```html title="Component.html"
<show when="state.visible">
  <div class="panel">Always on the page; only hidden or shown.</div>
</show>
```

Como no se elimina nada, un `<video>` que se está reproduciendo, una animación en marcha o el texto escrito en un input sobreviven a ocultarse y volver a mostrarse.

**Cómo funciona:** `<show>` se convierte en un envoltorio `<div data-o-show>`. Cuando está visible tiene `display: contents` (no ocupa espacio, así que los hijos se ven como si no estuviera). Cuando está oculto tiene `display: none`.

:::note
- El envoltorio siempre está ahí, así que una regla CSS como `.parent > .panel` no coincidirá. Usa `[data-o-show] > .panel` o quita el `>`.
- Un `<div>` no está permitido dentro de `<table>` ni de `<select>`, así que no uses `<show>` alrededor de filas de tabla ni de opciones. Ahí usa [`<if>`](/docs/conditionals) o un atributo `style`.
:::
