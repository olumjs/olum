---
title: Eventos
group: Sintaxis de plantillas
order: 110
source: 80c77f0c4147
---

Los eventos funcionan como en HTML normal: `onclick=""`, `oninput=""` y compañía contienen **código**.

```html title="Component.html"
<!-- call a function (or several) -->
<button onclick="inc()">+</button>
<button onclick="inc(), log()">both</button>

<!-- write an arrow function right there -->
<input oninput="(e) => state.text = e.target.value" />
<button onclick="e => state.n++">no parentheses needed</button>

<!-- $event is the DOM event -->
<input oninput="setValue($event)" />
```

:::note
No hay modificadores de eventos como `mode="prevent"` o `stop`. Hazlo en tu código: `onsubmit="(e) => { e.preventDefault(); save() }"`.
:::

## Varios eventos en un elemento {#several-events-on-one-element}

Usa tantos atributos `on*` como necesites:

```html title="Component.html"
<input oninput="draft($event)" onblur="save()" onkeydown="hotkey($event)" />

<div onmousedown="startDrag($event)" onmousemove="drag($event)" onmouseup="endDrag()">
  drag me
</div>
```

Los listeners se conservan entre actualizaciones y solo se reemplazan cuando cambia el manejador (o un valor dentro de él, como una variable del bucle). Usa [`onMount`](/docs/lifecycle) solo para listeners en `window` / `document`, o para los que necesitan opciones como `capture` / `passive`.

## Las variables del bucle funcionan sin más {#loop-variables-just-work}

Dentro de un [`<for>`](/docs/loops), los manejadores pueden usar la variable del bucle directamente:

```html title="Component.html"
<for each="flavour of state.menu">
  <button onclick="remove(flavour)">{flavour}</button>
  <button onclick="() => state.pick = flavour">pick</button>
</for>
```

## Los eventos en tus componentes son distintos {#events-on-your-components-are-different}

Todo lo anterior es para **etiquetas HTML normales** (en minúsculas, como `<input>`). En **tus propios componentes** (en PascalCase, como `<Input/>`), un atributo `on*` es una [prop de función](/docs/components#function-props), y solo acepta el **nombre** de una función entre `{ }`:

```html title="Component.html"
<input oninput="e => console.log(123)" />    <!-- ✓ HTML tag: code is fine -->
<Input oninput="{handleInput}" />            <!-- ✓ your component: a name -->
<Input oninput="e => console.log(123)" />    <!-- ✗ arrives as a string, never runs -->
<Input oninput="{e => console.log(123)}" />  <!-- ✗ arrives as undefined -->
```

Lo único que los distingue es la mayúscula.

## Teclado {#keyboard}

- `keydown` se dispara primero. Es el único en el que `preventDefault()` impide que se escriba el carácter.
- `keyup` se dispara al final.
- `keypress` es antiguo: nunca ve teclas como `Escape` o las flechas.

```html title="TagInput.html"
<script>
  const state = { draft: "", tags: ["olum", "forms"] };

  const handleKeydown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (state.draft.trim()) state.tags.push(state.draft.trim());
      state.draft = "";
    }
    if (e.key === "Escape") state.draft = "";
    if (e.key === "Backspace" && !state.draft) state.tags.pop();   // remove the last tag
    if (e.key === "s" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();                                          // stop the browser's "save page"
      save();
    }
  };
</script>

<input
  value="{state.draft}"
  oninput="(e) => state.draft = e.target.value"
  onkeydown="handleKeydown($event)"
/>
```

Campos útiles del evento: `e.key` (el carácter o el nombre de la tecla), `e.code` (la tecla física), `e.ctrlKey` / `e.shiftKey` / `e.altKey` / `e.metaKey`, y `e.repeat` (la tecla se mantiene pulsada). Ejemplo: [`/forms/keyboard-events`](/forms/keyboard-events).

## Foco, blur y selección {#focus-blur-and-selection}

```html title="Profile.html"
<script>
  const state = { nickname: "", focused: "", touched: {}, selection: "" };

  const onFocus = (e) => (state.focused = e.target.name);

  const onBlur = (e) => {
    state.focused = "";
    state.touched[e.target.name] = true;   // e.g. show errors only after the user leaves the field
  };

  const onSelect = (e) => {
    const field = e.target;
    state.selection = field.value.slice(field.selectionStart, field.selectionEnd);
  };

  const focusNickname = () => host.querySelector("[name=nickname]").focus();
</script>

<input
  name="nickname"
  value="{state.nickname}"
  oninput="(e) => state.nickname = e.target.value"
  onfocus="onFocus($event)"
  onblur="onBlur($event)"
  onselect="onSelect($event)"
  autofocus
/>

<button onclick="focusNickname()">Focus the nickname</button>
```

:::warn
`focus` y `blur` no burbujean hacia los elementos padre. Ponlos en el propio campo, no en un envoltorio.
:::

Para llegar a un elemento desde el código, usa `host.querySelector(…)` como en el botón de arriba ([`host`](/docs/lifecycle#host)). Ejemplo: [`/forms/focus-and-selection`](/forms/focus-and-selection).

## Arrastrar y soltar {#drag-and-drop}

`dragover` **debe** llamar a `preventDefault()`, si no, el navegador rechaza el drop (y abre el archivo en su lugar):

```html title="Dropzone.html"
<script>
  const state = { over: false, files: [] };

  const allowDrop = (e) => {
    e.preventDefault();
    state.over = true;
  };

  const onDrop = (e) => {
    e.preventDefault();
    state.over = false;
    state.files = Array.from(e.dataTransfer.files);   // same as a file input's files
  };
</script>

<div
  class="dropzone {state.over ? 'over' : ''}"
  ondragenter="allowDrop($event)"
  ondragover="allowDrop($event)"
  ondragleave="() => state.over = false"
  ondrop="onDrop($event)"
>
  Drop files here
</div>
```

Para reordenar una lista, añade `draggable="true"` a cada fila y mueve el elemento en el array. Añade una [`key`](/docs/loops#keys-add-one-when-items-can-move) para que cada fila conserve su propio elemento:

```html title="Sortable.html"
<for each="(item, index) of state.items" key="item">
  <li
    draggable="true"
    ondragstart="onItemDragStart(index, $event)"
    ondragover="(e) => e.preventDefault()"
    ondrop="onItemDrop(index, $event)"
    ondragend="() => state.dragging = null"
  >
    {item}
  </li>
</for>
```

Ejemplo: [`/forms/drag-and-drop`](/forms/drag-and-drop).

## Eventos que debes añadir a mano {#events-you-must-add-by-hand}

`copy`, `cut`, `paste`, `beforeinput`, `focusin` y `focusout` **no** se pueden escribir como atributos `on*`. Añádelos en [`onMount`](/docs/lifecycle) y quítalos en la limpieza:

```html title="Note.html"
<script>
  import { onMount } from "olum";

  const state = { text: "Copy me, or paste something here.", pasted: "" };

  onMount(() => {
    const field = host.querySelector("[name=note]");

    const onPaste = (e) => (state.pasted = e.clipboardData.getData("text/plain"));
    const onCopy = () => console.log("copy");

    field.addEventListener("paste", onPaste);
    field.addEventListener("copy", onCopy);

    return () => {
      field.removeEventListener("paste", onPaste);
      field.removeEventListener("copy", onCopy);
    };
  });
</script>

<textarea name="note" value="{state.text}" oninput="(e) => state.text = e.target.value"></textarea>
```

El mismo patrón sirve para listeners de `window` / `document` y para las opciones `capture` / `passive`.

Para **escribir** en el portapapeles, llama a `navigator.clipboard.writeText(state.text)`. Devuelve una promesa, y el navegador puede rechazarla. Ejemplo: [`/forms/clipboard-events`](/forms/clipboard-events).
