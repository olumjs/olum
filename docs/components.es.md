---
title: Componentes y props
group: Componentes
order: 160
source: 7b9978640bfb
---

Importa un componente en `<script>` y luego úsalo como una etiqueta en **PascalCase**. Los atributos que le das son sus **props**:

```html title="Parent.html"
<script>
  import StatusBadge from "./StatusBadge";
  import CounterCard from "./CounterCard";
  const state = { score: 5, name: "Ann" };
</script>

<StatusBadge label="Online" color="#16a34a" />
<CounterCard title="Counter" initialValue="{state.score}" />
```

## Pasar props {#passing-props}

```html title="Parent.html"
<Comp
  title="Hello"               <!-- "Hello"   → text                         -->
  count="{n + 1}"             <!-- 6         → a real number                -->
  data="{state.user}"         <!-- {...}     → the real object              -->
  greet="Hi {state.name}"     <!-- "Hi Ann"  → text with a value inside     -->
/>
```

- Valor normal → **texto**.
- Solo `{expr}` y nada más → el **valor real** (número, objeto, array, función…).
- Texto mezclado con `{expr}` → **texto**.

:::note
No hay atajo de spread (`<Comp {...obj} />`). Pasa cada campo: `<Info name="{pkg.name}" version="{pkg.version}" />`.
:::

Los nombres de las props deben ser nombres simples en camelCase (letras, dígitos, `_`). Un nombre con guion como `data-x="1"` no funciona en un componente (el guion corta el nombre). Deja los atributos con guion para las etiquetas HTML normales.

## Leer props en el hijo {#reading-props-in-the-child}

Importa `props` de `olum` y toma lo que necesites, al **principio** de `<script>`:

```html title="StatusBadge.html"
<script>
  import { props } from "olum";
  const { label, color } = props();
</script>

<span class="badge" style="color:{color}">{label}</span>
```

Estos nombres **siempre tienen el valor más reciente**. Cuando el padre pasa un valor nuevo, `label` y `color` se actualizan en todas partes: en la plantilla, en las funciones, en los manejadores de eventos. (Olum convierte cada uso en una lectura nueva de `props().label` por ti. Escribir `props().label` tú mismo también funciona.)

### Valores por defecto {#default-values}

Usa los valores por defecto normales de JavaScript para cuando el padre no pasa una prop:

```html title="Nested.html"
<script>
  import { props } from "olum";
  const { answer = "a mystery" } = props();
</script>
<p>The answer is {answer}</p>
```

```html title="Parent.html"
<Nested answer="{42}" />   <!-- The answer is 42 -->
<Nested />                 <!-- The answer is a mystery -->
```

### Qué se mantiene actualizado {#what-stays-up-to-date}

```js
const { color } = props();               // ✓ up to date everywhere
const { color: c } = props();            // ✓ renamed: c is the parent's `color`
const { size = "md" } = props();         // ✓ with a default
const { theme: t = "dark" } = props();   // ✓ renamed + default
const { children } = props();            // ✓ slot content (see Slots)
const { onChange } = props();            // ✓ a function prop
```

Una variable de bucle o un parámetro de función con el mismo nombre oculta la prop dentro de ese bloque, igual que en JavaScript normal.

### Qué se lee una sola vez {#what-is-only-read-once}

Estos patrones conservan el valor del momento en que se creó el componente. No dan error, simplemente no se actualizan:

```js
const { a, ...rest } = props();          // ✗ rest is not updated (a still is)
const { user: { name } } = props();      // ✗ nested: use const { user } = props(), then user.name
const { [key]: v } = props();            // ✗ computed key: use props()[key]
onMount(() => {
  const { a } = props();                 // ✗ not at the top of <script>
});
const p = props();
const { a } = p;                         // ✗ indirect: destructure props() directly
const { a, b = a } = props();            // ✗ a default that uses another prop gets an old value
```

## Props de función {#function-props}

Una prop puede ser una **función**. Así es como un hijo le dice a su padre que pasó algo: el padre pasa una función y el hijo la llama.

```html title="Parent.html"
<script>
  import Inner from "./Inner";
  const handleMessage = (payload) => alert(payload.text);
</script>

<Inner onMessage="{handleMessage}" />
```

```html title="Inner.html"
<script>
  import { props } from "olum";
  const { onMessage } = props();
  const sayHello = () => onMessage({ text: "Hello!" });
</script>

<button onclick="sayHello()">Click to say hello</button>
```

### Pasa el nombre de una función, nunca código en línea {#pass-a-function-name-never-inline-code}

Una prop de función debe ser un **nombre**: o una función de nivel superior de este componente, o un nombre que obtuviste de `props()` (para seguir pasándolo hacia abajo).

```html title="Parent.html"
<script>
  import Input from "./Input";          // YOUR component (Input.html)
  const handleInput = (e) => (state.text = e.target.value);
</script>

<Input oninput="{handleInput}" />        <!-- ✓ a name -->

<Input oninput="() => console.log(123)" />     <!-- ✗ arrives as the TEXT "() => console.log(123)" -->
<Input oninput="{() => console.log(123)}" />   <!-- ✗ inline function: arrives as undefined -->
<Input oninput="{state.handlers.input}" />     <!-- ✗ not a plain name: arrives as undefined -->
<Input oninput="{makeHandler(id)}" />          <!-- ✗ passes what the call returns, not a function -->
```

Olum no te avisa. El hijo falla con `oninput is not a function` cuando la llama. La solución es siempre la misma: dale un nombre a la función en `<script>` y pasa el nombre.

:::warn
Esta regla es **solo para tus componentes** (PascalCase). En las etiquetas HTML normales (minúsculas), `on*` es un evento real del DOM y el código en línea está bien ([Eventos](/docs/events)):

```html title="Component.html"
<input oninput="e => console.log(123)" />    <!-- ✓ HTML <input>: inline code works -->
<Input oninput="e => console.log(123)" />    <!-- ✗ your <Input/> component: needs "{handler}" -->
```

Incluso `onclick` es solo una prop en un componente: `<CustomButton onclick="{handleClick}" />` le da una función al hijo, y el hijo decide cuándo llamarla (por ejemplo, desde su propio `<button onclick="onclick()">`).
:::

**¿Necesitas que la función sepa para qué elemento es?** No puedes rellenar argumentos de antemano en la etiqueta. Pasa el elemento como prop y deja que el hijo lo devuelva:

```html title="List.html"
<!-- ✗ doesn't work -->
<for each="row of state.rows" key="row.id">
  <Row onPick="{() => pick(row.id)}" />
</for>

<!-- ✓ pass the row; the child calls onPick(row.id) -->
<for each="row of state.rows" key="row.id">
  <Row row="{row}" onPick="{pick}" />
</for>
```

**Pasarla a través de un componente intermedio** es simplemente volver a pasar la prop:

```html title="Outer.html"
<script>
  import Inner from "./Inner";
  import { props } from "olum";
  const { onMessage } = props();
</script>

<Inner onMessage="{onMessage}" />
```

**Dentro del slot de otro componente** también funciona. El nombre se busca en el archivo donde escribiste la etiqueta:

```html title="Page.html"
<script>
  import Section from "./Section";
  import Card from "./Card";
  const pick = (id) => (state.picked = id);
</script>

<Section>
  <Card onPick="{pick}" />   <!-- `pick` from Page.html arrives fine -->
</Section>
```

## Las props son de solo lectura {#props-are-read-only}

Los datos bajan **hacia abajo** mediante props, y los cambios suben **hacia arriba** mediante props de función. Un hijo no puede cambiar una prop:

- Asignar `props().x = …` no hace nada (y muestra un aviso).
- Asignar un nombre desestructurado (`color = "x"`) lanza `Assignment to constant variable`.

En su lugar, el padre pasa una función que el hijo llama para pedir el cambio:

```html title="Parent.html"
<script>
  import CounterCard from "./CounterCard";
  const state = { score: 0 };
  const setScore = (n) => (state.score = n);
</script>

<CounterCard value="{state.score}" onChange="{setScore}" />
```

```html title="CounterCard.html"
<script>
  import { props } from "olum";
  const { value, onChange } = props();
  const inc = () => onChange(value + 1);
</script>

<button onclick="inc()">{value} +1</button>
```

El padre actualiza su `state` y el nuevo valor vuelve a bajar al hijo. Ejemplo funcional: [`/forms/callback-props`](/forms/callback-props) (un teclado numérico que edita el código de su padre).

Si **muchos** componentes necesitan leer y cambiar el mismo valor, usa el [store global](/docs/store/global-store) en lugar de pasar props por todos los niveles.
