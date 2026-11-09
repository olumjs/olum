---
title: Limitaciones
group: Avanzado
order: 270
source: 63fd71405920
---

Olum es pequeño a propósito, así que le faltan algunas cosas. Cada una tiene una solución sencilla.

## 1. Las listas sin `key` emparejan filas por posición {#1-lists-without-key-match-rows-by-position}

Si una lista `<for>` sin key se reordena, las filas se repintan con los datos del vecino, así que cosas como una casilla marcada parecen saltar a la fila equivocada. Añade [`key`](/docs/loops#keys-add-one-when-items-can-move) y las filas se moverán. Consulta [Renderizado y actualizaciones](/docs/rendering#keys-which-element-is-which).

## 2. No hay refs de elementos ni acciones {#2-no-element-refs-or-actions}

No hay `bind:this` ni `use:action`. Hazlo tú mismo en [`onMount`](/docs/lifecycle), usa `host` para encontrar el elemento y devuelve una limpieza:

```html title="Component.html"
<script>
  import { onMount } from "olum";
  import { longpress } from "./longpress.js";

  onMount(() => {
    const button = host.querySelector("button");   // the "ref"
    const action = longpress(button, 2000);        // the "action"
    return () => action.destroy();                 // cleanup when removed
  });
</script>

<button>press and hold</button>
```

`onMount` se ejecuta una vez, no en cada actualización. No pasa nada: las actualizaciones [cambian los elementos en su sitio](/docs/rendering), así que el botón sigue siendo el mismo elemento y sigue funcionando. Si el comportamiento depende del state, lee el state dentro de sus manejadores.

(Las animaciones **sí** vienen incluidas. Consulta [Transiciones](/docs/transition/transitions).)

## 3. No hay elementos `<window>` / `<document>` / `<body>` {#3-no-window--document--body-elements}

Para escuchar eventos globales, añade el listener en `onMount` y quítalo en la limpieza:

```html title="Component.html"
<script>
  import { onMount } from "olum";

  const state = { keys: [] };
  const handleKeydown = (e) => (state.keys = [...state.keys, e.key].slice(-8));

  onMount(() => {
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  });
</script>
```

Lo mismo para eventos de `document` como `selectionchange`.

## 4. No hay etiqueta de componente dinámico {#4-no-dynamic-component-tag}

No hay `<component is="…">`. Usa `<if>` / `<else-if>` con un valor en el state:

```html title="Component.html"
<script>
  import RedThing from "./RedThing";
  import GreenThing from "./GreenThing";
  import BlueThing from "./BlueThing";

  const state = { color: "red" };
</script>

<if when="state.color === 'red'"><RedThing /></if>
<else-if when="state.color === 'green'"><GreenThing /></else-if>
<else><BlueThing /></else>
```

## 5. Las props de función deben ser un nombre {#5-function-props-must-be-a-name}

En tus propios componentes, una prop de función solo funciona cuando es un simple **nombre** (una función del `<script>` del padre, o una que viene de `props()`). Una flecha en línea, `obj.fn` o una llamada no llegan como función:

```html title="Parent.html"
<!-- <Input/> = YOUR component, not the HTML <input/> -->
<Input oninput="{handleInput}" />              <!-- ✓ -->
<Input oninput="(e) => state.text = e" />      <!-- ✗ arrives as text -->
<Input oninput="{(e) => state.text = e}" />    <!-- ✗ arrives as undefined -->
```

Las etiquetas HTML normales no se ven afectadas: ahí el código en línea en `on*` está bien ([Eventos](/docs/events)). Para pasar datos extra, envíalos como su propia prop y deja que el hijo los devuelva ([Componentes y props](/docs/components#function-props)).
