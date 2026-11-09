---
title: Enlace bidireccional
group: Sintaxis de plantillas
order: 120
source: efc695f8c242
---

Olum no tiene un atributo `model`. Para conectar un input con el state, escribes dos cosas:

1. un atributo que **lee** del state (`value`, `checked`, `selected`)
2. un evento que **escribe** de vuelta en el state (`oninput`, `onchange`)

```html title="Component.html"
<input value="{state.text}" oninput="(e) => state.text = e.target.value" />
```

Ese es todo el patrón. Más tipos de campo (fecha, color, archivo, validación, `FormData`, …) están en [Formularios y entradas](/docs/forms).

Una actualización nunca borra lo que el usuario está escribiendo: el input solo cambia cuando su valor en la plantilla cambió, y el cursor se queda en su sitio. Consulta [Renderizado y actualizaciones](/docs/rendering#inputs-are-never-reset-by-accident).

## Texto, textarea, número {#text-textarea-number}

```html title="Component.html"
<input value="{state.text}" oninput="(e) => state.text = e.target.value" />

<!-- textarea uses value="" too (if it also has text inside, value wins) -->
<textarea value="{state.text}" oninput="(e) => state.text = e.target.value"></textarea>

<!-- e.target.value is always a string: turn it into a number with + -->
<input type="number" value="{state.n}" oninput="(e) => state.n = +e.target.value" />
<input type="range" value="{state.n}" oninput="(e) => state.n = +e.target.value" min="0" max="10" />
```

## Checkbox {#checkbox}

Enlaza `checked` y lee `e.target.checked` en `change`:

```html title="Component.html"
<input type="checkbox" checked="{state.yes}" onchange="(e) => state.yes = e.target.checked" />

<button disabled="{!state.yes}">Sign up</button>
```

`checked` y `disabled` son [atributos booleanos](/docs/attributes#boolean-attributes): se añaden cuando el valor es verdadero y se quitan cuando es falso. Ejemplo: [`/forms/checkboxes`](/forms/checkboxes).

## Botones de radio {#radio-buttons}

Cada radio comprueba si coincide con el valor compartido. Dales el mismo `name` para que el navegador los agrupe:

```html title="Component.html"
<label>
  <input type="radio" name="scoops" checked="{state.scoops === 1}" onchange="setScoops(1)" />
  One scoop
</label>
<label>
  <input type="radio" name="scoops" checked="{state.scoops === 2}" onchange="setScoops(2)" />
  Two scoops
</label>
```

## Select {#select}

Pon `selected="{…}"` en la `<option>` correcta y lee la elección en `onchange`:

```html title="Component.html"
<select onchange="(e) => state.color = e.target.value">
  <option value="red" selected="{state.color === 'red'}">red</option>
  <option value="green" selected="{state.color === 'green'}">green</option>
</select>

<!-- with a loop: e.target.selectedIndex is the position in the array -->
<select onchange="(e) => state.selected = state.questions[e.target.selectedIndex]">
  <for each="question of state.questions">
    <option value="{question.id}" selected="{state.selected && state.selected.id === question.id}">
      {question.text}
    </option>
  </for>
</select>
```

:::warn
`value="{…}"` en el propio `<select>` **no hace nada**. Pon siempre `selected="{…}"` en las opciones.
:::

Para selección múltiple e inputs de archivo, consulta [Formularios y entradas](/docs/forms).
