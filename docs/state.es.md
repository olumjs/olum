---
title: Estado y reactividad
group: Reactividad
order: 30
source: 28d31ae11591
---

Pon los datos que muestra tu componente en `const state = { ... }`. **Cuando cambias `state`, la página se actualiza sola.**

```html title="Component.html"
<script>
  const state = { count: 0, user: { name: "Ann" } };

  const inc = () => state.count++;                 // page updates
  const rename = () => (state.user.name = "Bo");   // nested changes update it too
</script>

<p>{state.count} — {state.user.name}</p>
<button onclick="inc()">+</button>
```

:::warn
Solo `state` es reactivo. Cambiar una variable `const` o `let` normal **no** actualiza la página.
:::

## Escribe `state` como un objeto literal {#write-state-as-a-literal-object}

Debe ser un `const state = { ... }` de nivel superior con el objeto escrito ahí mismo. `const state = makeState()` no se detecta, así que nada se actualizará.

## Funcionan los cambios a cualquier profundidad {#changes-at-any-depth-work}

Se detectan objetos anidados, arrays, `Map` y `Set`:

```js
state.user.name = "Bo";          // ✓ nested object
state.user.prefs.theme = "dark"; // ✓ any depth
state.todos.push(todo);          // ✓ array methods (push, splice, sort, …)
state.todos[0].done = true;      // ✓ array item
state.tags.add("new");           // ✓ Map / Set
```

Otros tipos de objetos (`Date`, elementos del DOM, instancias de clases) **no** se detectan. Después de cambiar uno, asigna un valor **nuevo** a su clave: `state.date = new Date(state.date)`.

:::warn
Volver a asignar el **mismo** objeto (`state.todos = state.todos`) no hace nada, porque nada cambió. Para forzar una actualización, asigna un array u objeto nuevo (`[...state.todos]`, `map`, `filter`, `slice`, `{ ...obj }`).
:::

## Los valores derivados son simples funciones {#derived-values-are-just-functions}

¿Necesitas un valor calculado a partir del state? Escribe una función y llámala en la plantilla. Se vuelve a ejecutar en cada actualización, así que siempre está al día. Las funciones pueden llamarse entre sí:

```html title="Component.html"
<script>
  const state = { count: 1 };

  const doubled = () => state.count * 2;
  const quadrupled = () => doubled() * 2;
</script>

<p>{state.count} * 2 = {doubled()}</p>
<p>{doubled()} * 2 = {quadrupled()}</p>
```

## Las actualizaciones se agrupan {#updates-are-grouped}

Varios cambios seguidos (`state.a++; state.b++`, o un solo `splice` en un array grande) provocan **una** actualización, no muchas. Y la actualización solo [cambia lo que es distinto](/docs/rendering) en la página. Así que cambia `state` de la forma que mejor se lea; no hay ninguna razón de rendimiento para evitar `push` o `splice`.

El detalle: la página se actualiza un momento **después** de tu cambio, no en la misma línea. Si necesitas leer la página actualizada de inmediato (sobre todo en tests), llama a `flushUpdates()`:

```js
import { flushUpdates } from "olum";

state.count++;
flushUpdates();                         // apply pending updates now
host.querySelector("span").textContent; // up to date
```

:::note
`window.olum.flushUpdates()` hace lo mismo, pero solo en desarrollo. En producción, `window.olum` solo tiene `version` y `framework` (para herramientas de detección), así que importa `flushUpdates` en su lugar.
:::

Los [watchers](/docs/watchers) son distintos: se ejecutan al instante, una vez por cambio.

Cambiar una clave del state que la plantilla nunca usa no actualiza la página en absoluto. Consulta [Renderizado y actualizaciones](/docs/rendering).
