---
title: Depuración
group: Sintaxis de plantillas
order: 150
source: 68f554f1ee61
---

## `<log>`: imprime un valor cuando cambia {#log-print-a-value-when-it-changes}

Pon `<log>{expr}</log>` en cualquier parte de tu plantilla. Ejecuta `console.log(expr)` cuando el componente aparece por primera vez y **cada vez que ese valor cambia**. No muestra nada en la página. (Como `{@debug}` de Svelte.)

```html title="Component.html"
<script>
  const state = { user: { firstname: "Ada", lastname: "Lovelace" } };
</script>

<input value="{state.user.firstname}" oninput="(e) => state.user.firstname = e.target.value" />

<log>{state.user}</log>

<h1>Hello {state.user.firstname}!</h1>
```

Abre la consola del navegador y escribe en el campo: `user` se imprime en cada cambio.

- Imprime varios valores separados por comas: `<log>{state.a, state.b}</log>` se convierte en `console.log(state.a, state.b)`.
- Solo imprime cuando cambia una clave de state **que lee**. `<log>{state.x}</log>` no dice nada cuando cambia `state.y`.

Para tener más control (parar solo bajo una condición), pon `debugger;` o `console.log` dentro de un [watcher](/docs/watchers).
