---
title: Errores comunes
group: Avanzado
order: 280
source: 81301d5481bf
---

Olum tiene **una sola forma** de hacer cada cosa, y los valores siempre van **entre comillas**. Esto es lo que la gente que viene de otros frameworks suele escribir por error.

## Sintaxis de plantillas {#template-syntax}

| ✗ No escribas | ✓ Escribe en su lugar | Por qué |
|---------------|-----------------|-----|
| `when={x}` / `each={x}` | `when="x"` / `each="x"` | los valores van entre `""` |
| `value={state.x}` | `value="{state.x}"` | atributo de texto + `{}` |
| `:title="x"` | `title="{x}"` | no hay bindings con `:` |
| `:style="{…}"` | `style="color:{x}; …"` | style es texto + `{}` |
| `<img {src} />` | `<img src="{src}" />` | no hay forma abreviada |
| `oninput={(e)=>…}` | `oninput="(e)=>…"` | los eventos van entre `""` |
| `mode="prevent"` | `e.preventDefault()` en el manejador | no hay modificadores de eventos |
| `model="state.x"` | `value="{state.x}"` + `oninput` | [enlaza a mano](/docs/two-way-binding) |
| un `{` literal en el texto | `{String.fromCharCode(123)}` | cualquier `{…}` es código |
| `each="i of state.n"` | `each="i of Array.from({length: state.n}, (_, k) => k + 1)"` | el conteo debe ser un número escrito |
| `url(assets/x.svg)` / `src="assets/…"` | `url(/assets/x.svg)` | las URL de archivos [empiezan con `/`](/docs/static-assets) |
| `oninput="…" onblur="…"` en un elemento | así está bien | funcionan varios `on*` por elemento |

## Componentes y props {#components-and-props}

| ✗ No escribas | ✓ Escribe en su lugar | Por qué |
|---------------|-----------------|-----|
| `<comp/>` | `<Comp/>` | los componentes van en PascalCase |
| `<Comp {a} />` / `<Comp a={a} />` | `<Comp a="{a}" />` | no hay forma abreviada, valores entre `""` |
| `<Comp {...obj} />` | `<Comp a="{obj.a}" b="{obj.b}" />` | no hay spread, pasa cada campo |
| `<Comp onX="(e)=>…" />` | `<Comp onX="{handler}" />` | en un componente, `on*` es una prop; la flecha llega como texto |
| `<Comp onX="{(e)=>…}" />` / `<Comp onX="{obj.fn}" />` | ponle nombre a la función y pasa el nombre | las [props de función](/docs/components#function-props) deben ser un nombre, o llegan como `undefined` |
| `const { color } = props(); color = "x"` | `const { onChange } = props(); onChange("x")` | las props son de solo lectura (asignar lanza un error) |
| `const { a, ...rest } = props()` | usa `props()` para lo demás | `rest` [nunca se actualiza](/docs/components#what-is-only-read-once) |
| `const { user: { name } } = props()` | `const { user } = props()`, y luego `user.name` | los patrones anidados no se actualizan |
| `const { [key]: v } = props()` | `props()[key]` | las claves calculadas no se actualizan |
| `const p = props(); const { a } = p` | `const { a } = props()` | desestructura `props()` directamente |
| `onMount(() => { const { a } = props(); … })` | desestructura al principio de `<script>` | dentro de una función se lee una sola vez |
| `const { a, b = a } = props()` | dale a `b` su propio valor por defecto | un valor por defecto que usa otra prop recibe un valor antiguo |

## State {#state}

| ✗ No escribas | ✓ Escribe en su lugar | Por qué |
|---------------|-----------------|-----|
| `state.user.name = "Bo"` | así está bien | la reactividad es [profunda](/docs/state) |
| `state.todos.push(t)` | así está bien | los cambios en el sitio funcionan y se agrupan en una actualización |

## Formularios y eventos {#forms-and-events}

| ✗ No escribas | ✓ Escribe en su lugar | Por qué |
|---------------|-----------------|-----|
| `<select value="{x}">` | `selected="{x === …}"` en cada `<option>` | `value` en `<select>` no hace nada |
| `<textarea>{state.text}</textarea>` | `<textarea value="{state.text}">` | un textarea se enlaza con `value` |
| `state.n = e.target.value` en un campo numérico | `state.n = +e.target.value` | `e.target.value` siempre es texto |
| `new Date(state.date)` en un input de fecha | `new Date(state.date + "T00:00:00")` | los inputs de fecha dan texto, no un `Date` |
| `state.files.map(…)` | `Array.from(state.files).map(…)` | es un `FileList`, no un array |
| un `contenteditable` que no se guarda en el state | copia `textContent` / `innerHTML` al state | la siguiente actualización borra lo que no está en el state |
| `onfocus` / `onblur` en un envoltorio | ponlos en el campo | focus y blur no burbujean |
| `ondragover` sin `preventDefault()` | `ondragover="(e)=> e.preventDefault()"` | si no, se rechaza el drop |
| `oncopy` / `onpaste` / `onfocusin` como atributos | añádelos en `onMount` y quítalos en su limpieza | [no se admiten como atributos](/docs/events#events-you-must-add-by-hand) |

## Ciclo de vida, refs y enrutamiento {#lifecycle-refs-and-routing}

| ✗ No escribas | ✓ Escribe en su lugar | Por qué |
|---------------|-----------------|-----|
| `bind:this` / refs de elementos | `host.querySelector(…)` | no hay refs, usa [`host`](/docs/lifecycle#host) |
| `use:action` | configúralo en `onMount` y límpialo en lo que devuelve | no hay acciones ([limitaciones](/docs/limitations)) |
| dos llamadas a `onMount(…)` | una llamada, una limpieza combinada | solo se usa la primera |
| `push("/shop?tab=" + tab)` para guardar un filtro en la URL | `setSearchParam("tab", tab)` | `push()` vuelve a renderizar la página y reinicia su state ([detalles](/docs/router/programmatic-navigation#updating-the-query-without-rendering)) |
