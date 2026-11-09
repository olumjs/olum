---
title: Renderizado y actualizaciones
group: Reactividad
order: 60
source: afc183e1b614
---

En Olum nunca llamas a una función "render". Cambias el [`state`](/docs/state) o un [store](/docs/store/global-store), y la página se actualiza. Esta página explica qué pasa entre medias.

## Qué pasa después de un cambio {#what-happens-after-a-change}

1. **Se detecta el cambio.** Cambiar `state` (a cualquier profundidad) marca ese componente para actualizarse. Cambiar un store marca todos los componentes que lo usaron.
2. **Las actualizaciones se agrupan.** Todos los componentes marcados se actualizan **una vez**, justo cuando termina tu código. `state.a++; state.b++`, o un `splice` que mueve 100 filas, es una sola actualización.
3. **El nuevo HTML se construye fuera de la pantalla.** Todavía no ha cambiado nada en la página.
4. **Solo se aplican las diferencias.** Olum compara el nuevo HTML con la página y cambia solo lo que es distinto. Los elementos sin cambios no se tocan.

Si un padre y su hijo necesitan actualizarse a la vez, solo se actualiza el **padre** (y eso actualiza también al hijo).

## Qué sobrevive a una actualización {#what-survives-an-update}

Los elementos sin cambios se dejan tal cual, así que se conserva todo lo que el navegador guarda en ellos:

- el foco, el cursor de texto y la selección de texto
- la posición de scroll (también dentro de cajas con scroll)
- un `<video>` o `<audio>` que se está reproduciendo, las animaciones y transiciones CSS en marcha
- el contenido de `<iframe>` y `<canvas>`
- todo lo que la plantilla no define, como el valor de un input que no está enlazado al state
- los listeners de eventos (un listener solo se reemplaza cuando cambió su manejador, o un valor que usa, como una variable del bucle)

:::tip
Por eso Olum no tiene ninguna opción de "mantener el foco" que aprender. Actualiza sin miedo.
:::

## Solo se actualizan los componentes que lo necesitan {#only-components-that-need-it-update}

- **Las claves sin usar se omiten.** Olum sabe qué claves de `state` lee cada plantilla. Cambiar una clave que la plantilla no usa (por ejemplo, una que solo se usa en manejadores o en `onMount`) no actualiza nada.
- **El uso de stores es automático.** Un componente sigue a un store simplemente por *leerlo* en su plantilla. Los componentes que solo escriben en un store nunca se actualizan por él.
- **Los componentes eliminados se omiten.** Una actualización pendiente de un componente que ya no existe (cambio de ruta, `<if>` cerrado) se descarta.

## Keys: qué elemento es cuál {#keys-which-element-is-which}

Cuando una lista cambia, Olum empareja los elementos antiguos y los nuevos:

- Un componente conserva su identidad, así que se reutiliza y mantiene su state.
- Un elemento normal puede recibir una identidad con `key="{item.id}"`, o con `key` en su [`<for>`](/docs/loops).
- Los elementos con key se **mueven**, no se vuelven a crear (usando `moveBefore` cuando el navegador lo tiene, así que incluso un vídeo en reproducción sobrevive).
- Los elementos sin key se emparejan por posición. Olum aun así puede detectar una inserción o un borrado simple, así que las filas de abajo no se reconstruyen.

Un cambio más grande sin keys (ordenar, filtrar varias filas) no se puede emparejar así: las filas se repintan con los datos del vecino en lugar de moverse. Añade `key` para arreglarlo. Consulta [Limitaciones](/docs/limitations).

## Los inputs nunca se reinician por accidente {#inputs-are-never-reset-by-accident}

Olum solo escribe `value` o `checked` en un input cuando cambió el valor de **la plantilla**. Así, una actualización ajena nunca borra lo que se está escribiendo, pero un input enlazado al state sigue cambiando cuando cambia el state. Si escribe en el campo que tiene el foco, el cursor se queda donde estaba. Un `<select>` conserva la elección del usuario a menos que la plantilla mueva `selected`. Consulta [Enlace bidireccional](/docs/two-way-binding).

## Leer la página justo después de un cambio {#reading-the-page-right-after-a-change}

Como las actualizaciones se agrupan, en la línea siguiente a un cambio la página todavía es la antigua. Aplica ya las actualizaciones pendientes con `flushUpdates()`:

```js
import { flushUpdates } from "olum";

state.count++;
flushUpdates();                           // apply pending updates now
host.querySelector("span").textContent;   // up to date
```

Es seguro llamarla en cualquier momento (no hace nada si no hay nada pendiente). Es útil sobre todo en tests o cuando necesitas medir elementos nuevos.

:::note
Si alguna vez falla una actualización, Olum muestra `patch failed — falling back to full re-render` y reconstruye el componente desde cero. La página sigue siendo correcta, pero el foco, los medios y el scroll se reinician. Por favor, informa de ese aviso como un bug.
:::
