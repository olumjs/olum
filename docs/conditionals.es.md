---
title: Condicionales
group: Sintaxis de plantillas
order: 80
source: 4117f1ba9e5d
---

Muestra HTML distinto según una condición. `when` recibe una expresión de JavaScript (no hace falta `{ }`):

```html title="Component.html"
<if when="state.tab === 'a'">
  <p>Tab A</p>
</if>
<else-if when="state.tab === 'b'">
  <p>Tab B</p>
</else-if>
<else>
  <p>Fallback</p>
</else>
```

Funciona cualquier condición de JavaScript:

```html title="Component.html"
<if when="state.count >= 5 && state.count < 10">in range</if>
```

Cuando la condición es falsa, el contenido se **elimina** de la página. Para solo ocultarlo, usa [`<show>`](/docs/show).
