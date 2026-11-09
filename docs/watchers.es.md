---
title: Watchers
group: Reactividad
order: 50
source: e67e52f5534e
---

Un watcher ejecuta tu código cuando cambia una clave de `state`. Declara `const watcher = { ... }` con una función por clave. Cada función recibe el valor anterior y el nuevo:

````html title="Component.html"
<script>
  const state = { count: 0, log: "—" };
  const watcher = {
    count(old, next) {
      state.log = `count: ${old} → ${next}`;
    },
  };
</script>
<p>{state.count} — {state.log}</p>
````

Los watchers se ejecutan **al instante**, una vez por cambio (las actualizaciones de la página se agrupan; los watchers no).

:::warn
Un watcher solo se ejecuta cuando **asignas la clave en sí**: `state.user = ...`. Un cambio anidado como `state.user.name = "Bo"` o `state.todos.push(t)` actualiza la página pero **no** ejecuta el watcher. Si necesitas el watcher, asigna un valor nuevo: `state.user = { ...state.user, name: "Bo" }`.
:::
