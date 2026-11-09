---
title: Bucles
group: Sintaxis de plantillas
order: 100
source: 0588db1614c1
---

Repite HTML con `<for>`. `each` recibe una expresión de JavaScript (no hace falta `{ }`). Hay tres formas:

```html title="Component.html"
<!-- array: "item of list" -->
<for each="fruit of state.fruits">
  <li>{fruit.name}</li>
</for>

<!-- count: "i of N" (i goes 1 → N, not from 0) -->
<for each="i of 6">
  <span>Step {i}</span>
</for>

<!-- object keys: "key in obj" -->
<for each="key in state.settings">
  <div>{key}: {state.settings[key]}</div>
</for>
```

## Obtener el índice {#getting-the-index}

Usa paréntesis para obtener también el **índice** (desde 0) y el **array**, como en `Array.map`:

```html title="Component.html"
<for each="(cat, index, arr) of state.cats">
  <li>{index + 1}/{arr.length}: {cat.name}</li>
</for>
```

Los nombres extra son opcionales: `(cat, index)` también funciona.

Con objetos obtienes `(key, index, value)`, donde `value` es `obj[key]`:

```html title="Component.html"
<for each="(key, index, value) in state.settings">
  <div>{index}. {key} = {value}</div>
</for>
```

En la forma de conteo (`i of 6`) solo sirve el primer nombre, porque `i` ya cuenta de 1 → 6.

## Keys: añade una cuando los elementos pueden moverse {#keys-add-one-when-items-can-move}

Añade `key` para que Olum sepa qué elemento es cuál cuando la lista se reordena o cuando se añaden o eliminan elementos.

**Sin key**, borrar o mover un elemento hace que Olum reutilice las filas por posición y las rellene con los datos del vecino. Todo lo que "pertenece" a una fila (una casilla marcada, un vídeo que se reproduce, texto escrito) parece saltar a la fila equivocada. **Con key**, las filas se mueven.

`key` es una expresión de JavaScript (sin `{ }`) que debe ser única para cada elemento:

```html title="Component.html"
<!-- with components: each one keeps its own state -->
<for each="todo of state.todos" key="todo.id">
  <TodoRow todo="{todo}" />
</for>

<!-- with plain elements -->
<for each="todo of state.todos" key="todo.id">
  <li data-done="{todo.done}">{todo.text}</li>
</for>
```

:::note
La key va solo en el elemento que está directamente dentro de `<for>`, no en hijos más profundos. También puedes escribir tú mismo `key="{item.id}"` (con llaves) en un elemento normal; la forma de `<for>` simplemente lo hace por ti.
:::

## El conteo debe ser un número escrito {#the-count-must-be-a-written-number}

`each="i of 6"` solo funciona cuando el número está escrito ahí mismo. Un número que viene del state no funciona. Construye un array en su lugar:

```html title="Component.html"
<!-- ✗ breaks: state.n is a number, not an array -->
<for each="i of state.n">…</for>

<!-- ✓ i goes 1 → n -->
<for each="i of Array.from({ length: state.n }, (_, k) => k + 1)">…</for>
```
