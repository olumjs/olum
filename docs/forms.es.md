---
title: Formularios y entradas
group: Sintaxis de plantillas
order: 130
source: 1055d001b2a5
---

Cada campo es HTML normal. Sin componentes envoltorio ni librerías de formularios. Hay dos formas de manejar un formulario, y puedes combinarlas:

1. **Enlaza cada campo al state** con `value="{state.x}"` más un evento que escriba de vuelta ([Enlace bidireccional](/docs/two-way-binding)). Úsalo cuando la página deba reaccionar mientras el usuario escribe.
2. **No enlaces nada.** Dale a cada campo un `name` y lee todos los valores a la vez con `new FormData(form)` ([ver más abajo](#a-form-with-no-state)). Bueno para formularios grandes que solo importan al enviarse.

La mayoría de las secciones enlazan a un ejemplo ejecutable en `/forms/…`.

## Inputs de tipo texto {#text-like-inputs}

`text`, `email`, `password`, `tel`, `url` y `search` se enlazan todos igual. Una pequeña función auxiliar lo deja más corto:

```html title="Fields.html"
<script>
  const state = { text: "Eissa", email: "you@olumjs.top", password: "", reveal: false, plan: "pro" };

  const set = (key, e) => (state[key] = e.target.value);
</script>

<input type="text" name="text" value="{state.text}" oninput="set('text', $event)" maxlength="40" />
<input type="email" name="email" value="{state.email}" oninput="set('email', $event)" autocomplete="email" />

<!-- type is a normal attribute, so it can change -->
<input
  type="{state.reveal ? 'text' : 'password'}"
  name="password"
  value="{state.password}"
  oninput="set('password', $event)"
  minlength="8"
/>
<label>
  <input type="checkbox" checked="{state.reveal}" onchange="(e) => state.reveal = e.target.checked" />
  show the password
</label>

<!-- not visible, but still sent with the form -->
<input type="hidden" name="plan" value="{state.plan}" />

<input type="text" value="{state.text}" readonly />
<input type="text" value="not editable" disabled />
```

Todos los atributos HTML normales (`placeholder`, `maxlength`, `autocomplete`, `spellcheck`, `pattern`, …) funcionan como siempre. Ejemplo: [`/forms/text-input-types`](/forms/text-input-types).

## Números y rangos {#numbers-and-ranges}

`e.target.value` es **siempre un string**. Conviértelo en número con `+`:

```html title="Size.html"
<script>
  const state = { w: 4, h: 3 };
</script>

<input type="number" value="{state.w}" oninput="(e) => state.w = +e.target.value" min="0" max="10" />
<input type="range" value="{state.w}" oninput="(e) => state.w = +e.target.value" min="0" max="10" />

<p>area: {state.w} × {state.h} = {state.w * state.h}</p>
```

Los dos inputs usan la misma clave, así que al mover uno se mueve el otro. Ejemplo: [`/forms/numbers`](/forms/numbers).

## Textarea {#textarea}

Se enlaza con `value=""`, como un input. Si además tiene texto entre sus etiquetas, gana `value`:

```html title="Editor.html"
<script>
  import { marked } from "marked";

  const state = { text: "Olum components are **plain HTML**" };
</script>

<textarea value="{state.text}" oninput="(e) => state.text = e.target.value"></textarea>

<div html="marked(state.text)"></div>
```

`html=""` muestra el string como **HTML real**. Úsalo solo con contenido de confianza ([Escapado y seguridad](/docs/security)). Ejemplo: [`/forms/textarea`](/forms/textarea).

## Checkbox y radio {#checkbox-and-radio}

Consulta [Enlace bidireccional](/docs/two-way-binding#checkbox). Para una **lista de checkboxes**, usa [`<for>`](/docs/loops). La variable del bucle está disponible en el manejador:

```html title="Toppings.html"
<script>
  const state = { toppings: ["Caramelized onions"], menu: ["Olives", "Caramelized onions", "Jalapeños"] };

  const toggleTopping = (topping, e) => {
    if (e.target.checked) state.toppings.push(topping);
    else state.toppings = state.toppings.filter((t) => t !== topping);
  };
</script>

<for each="topping of state.menu">
  <label>
    <input
      type="checkbox"
      checked="{state.toppings.includes(topping)}"
      onchange="toggleTopping(topping, $event)"
    />
    {topping}
  </label>
</for>
```

Ejemplo: [`/forms/radio-groups`](/forms/radio-groups).

## Select {#select}

Selección simple: consulta [Enlace bidireccional](/docs/two-way-binding#select). Recuerda: `value` en `<select>` no hace nada, pon `selected` en las opciones.

Para `<select multiple>`, recoge tú mismo las opciones elegidas:

```html title="Toppings.html"
<select multiple onchange="onSelectToppings($event)">
  <for each="topping of menu">
    <option value="{topping}" selected="{state.toppings.includes(topping)}">{topping}</option>
  </for>
</select>
```

```js
const onSelectToppings = (e) => {
  state.toppings = Array.from(e.target.options)
    .filter((o) => o.selected)
    .map((o) => o.value);
};
```

`<optgroup>` es HTML normal, así que también puede venir de un bucle:

```html title="Country.html"
<select name="country" onchange="set('country', $event)">
  <for each="group of state.groups">
    <optgroup label="{group.label}">
      <for each="option of group.options">
        <option value="{option.code}" selected="{state.country === option.code}">{option.name}</option>
      </for>
    </optgroup>
  </for>
  <optgroup label="Not available yet" disabled>
    <option value="AQ">Antarctica</option>
  </optgroup>
</select>
```

Ejemplos: [`/forms/select`](/forms/select), [`/forms/multi-select`](/forms/multi-select).

## Fieldset {#fieldset}

Un solo `disabled` en un `<fieldset>` desactiva **todos** los campos que contiene, y esos campos ya no se envían con el formulario:

```html title="Shipping.html"
<fieldset disabled="{!state.ship}">
  <legend>Shipping address</legend>
  <input name="street" value="{state.street}" oninput="set('street', $event)" />
  <input name="city" value="{state.city}" oninput="set('city', $event)" />
</fieldset>
```

Ejemplo: [`/forms/fieldset-optgroup`](/forms/fieldset-optgroup).

## Datalist (sugerencias) {#datalist-suggestions}

Un `<datalist>` solo **sugiere** valores. El usuario puede escribir cualquier cosa igualmente:

```html title="Fruit.html"
<input list="fruit-options" name="fruit" value="{state.fruit}" oninput="set('fruit', $event)" />

<datalist id="fruit-options">
  <for each="fruit of state.fruits">
    <option value="{fruit.name}">{fruit.note}</option>
  </for>
</datalist>
```

Un `type="range"` también puede ajustarse a un datalist: dale `list="tick-options"` con entradas `<option value="25" label="25">`. Ejemplo: [`/forms/datalist-autocomplete`](/forms/datalist-autocomplete).

## Fecha y hora {#date-and-time}

`date`, `time`, `datetime-local`, `month` y `week` se enlazan como texto:

```html title="Dates.html"
<input type="date" name="date" value="{state.date}" oninput="set('date', $event)" min="2026-01-01" max="2026-12-31" />
<input type="time" name="time" value="{state.time}" oninput="set('time', $event)" step="900" />
<input type="datetime-local" name="datetime" value="{state.datetime}" oninput="set('datetime', $event)" />
<input type="month" value="{state.month}" oninput="set('month', $event)" />
<input type="week" value="{state.week}" oninput="set('week', $event)" />
```

:::note
El valor siempre es un **string** (`"2026-08-17"`, `"09:30"`, `"2026-W34"`), nunca un `Date`. Para obtener un `Date`: `new Date(state.date + "T00:00:00")`.
:::

Ejemplo: [`/forms/date-time`](/forms/date-time).

## Color {#color}

Un input de color dispara **dos** eventos con significados distintos:

```html title="Color.html"
<input
  type="color"
  value="{state.color}"
  oninput="(e) => state.color = e.target.value"
  onchange="(e) => state.committed = e.target.value"
/>
```

- `oninput` se ejecuta **mientras** el usuario arrastra en el selector. Úsalo para una vista previa en vivo.
- `onchange` se ejecuta **una vez**, cuando se cierra el selector. Úsalo para guardar.

Ejemplo: [`/forms/color-input`](/forms/color-input).

## Inputs de archivo {#file-inputs}

Solo el usuario puede definir el valor de un input de archivo, así que enlázalo **en un solo sentido**, del input al state:

```html title="Upload.html"
<input type="file" accept="image/png, image/jpeg" onchange="(e) => state.files = e.target.files" />
<input type="file" multiple onchange="(e) => state.files = e.target.files" />

<if when="state.files">
  <for each="file of Array.from(state.files)">
    <p>{file.name} ({file.size} bytes)</p>
  </for>
</if>
```

`state.files` es un `FileList`, no un array. Envuélvelo en `Array.from()` para recorrerlo o usar `map`. Ejemplo: [`/forms/files`](/forms/files).

## Output, progress y meter {#output-progress-and-meter}

```html title="Meters.html"
<output for="a b" name="total">{total()}</output>

<progress value="{state.uploaded}" max="100"></progress>
<progress></progress>  <!-- no value → endless "loading" animation -->

<meter value="{state.score}" min="0" max="100" low="30" high="70" optimum="100"></meter>
```

- `<output>` muestra un resultado. `for` indica a los lectores de pantalla de qué inputs viene.
- `<progress>` es para una tarea que termina. Sin `value` (quítalo con [`<if>`](/docs/conditionals)), muestra una animación sin fin.
- `<meter>` muestra una medida y se colorea solo usando `low` / `high` / `optimum`.

Ejemplo: [`/forms/output-progress-meter`](/forms/output-progress-meter).

## Inputs dentro de un bucle {#inputs-inside-a-loop}

Pasa el índice al manejador y cambia ese elemento:

```html title="Todos.html"
<script>
  const state = { todos: [{ done: false, text: "skim the Olum docs" }] };

  const toggleDone = (index, e) => (state.todos[index].done = e.target.checked);
  const setText = (index, e) => (state.todos[index].text = e.target.value);
</script>

<for each="(todo, index) of state.todos">
  <div>
    <input type="checkbox" checked="{todo.done}" onchange="toggleDone(index, $event)" />
    <input value="{todo.text}" oninput="setText(index, $event)" disabled="{todo.done}" />
  </div>
</for>
```

Escribir en una fila no afecta a las demás: un campo solo cambia cuando cambió su propio valor, y el cursor se queda en su sitio. Ejemplo: [`/forms/loop-inputs`](/forms/loop-inputs).

## Validación {#validation}

El navegador ya comprueba `required`, `pattern`, `min`, `max`, `minlength`, `type="email"`, etc. Usa `oninvalid` para mostrar el mensaje a tu manera:

```html title="Signup.html"
<script>
  const state = { user: "", errors: {}, skipValidation: false };

  const onInvalid = (e) => {
    e.preventDefault();                       // hide the browser's own bubble
    state.errors[e.target.name] = e.target.validationMessage;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!e.target.noValidate && !e.target.checkValidity()) return;
    state.errors = {};
    // send it…
  };
</script>

<form novalidate="{state.skipValidation}" onsubmit="handleSubmit($event)" onreset="handleReset()">
  <input
    name="user"
    value="{state.user}"
    oninput="set('user', $event)"
    oninvalid="onInvalid($event)"
    pattern="[a-z][a-z0-9_]+"
    minlength="3"
    required
  />
  <if when="state.errors.user">
    <p class="err">{state.errors.user}</p>
  </if>

  <button type="submit">Create account</button>
  <button type="submit" formnovalidate>Save draft (no checks)</button>
  <button type="reset">Reset</button>
</form>
```

- `novalidate="{…}"` en el formulario es un [atributo booleano](/docs/attributes#boolean-attributes), así que el state puede activar y desactivar las comprobaciones.
- `formnovalidate` en un botón se salta las comprobaciones solo para ese botón.

Para una regla que ningún atributo puede expresar (como "las dos contraseñas coinciden"), usa `setCustomValidity`. Un **string vacío** significa válido:

```js
const setConfirm = (e) => {
  const field = e.target;
  field.setCustomValidity(field.value === state.pass ? "" : "The two passwords do not match");
  state.confirm = field.value;
};
```

Ejemplo: [`/forms/validation`](/forms/validation).

## Eventos de formulario {#form-events}

`input` y `change` **burbujean**, así que un solo listener en el `<form>` cubre todos sus campos:

```html title="Signup.html"
<form
  onsubmit="handleSubmit($event)"
  onreset="handleReset()"
  onformdata="handleFormData($event)"
  oninput="handleInput($event)"
  onchange="handleChange($event)"
>
```

```js
const handleSubmit = (e) => {
  e.preventDefault();                    // always: stops the page from reloading
  const who = e.submitter ? e.submitter.value : "(keyboard)";   // which button was clicked
  const data = new FormData(e.target);
  state.submitted = {
    name: data.get("name"),
    topics: data.getAll("topics"),       // several checkboxes with one name
  };
};

const handleFormData = (e) => {
  e.formData.append("stamp", new Date().toISOString());   // add extra fields
};
```

- `e.submitter` es el botón que envió el formulario (`<button type="submit" value="publish">`).
- `data.getAll(name)` devuelve todos los valores cuando varios campos comparten un `name`.
- `formdata` se dispara cada vez que se ejecuta `new FormData(form)`.
- `<button type="button">` nunca envía el formulario. Úsalo para otras acciones dentro de un formulario.

Ejemplo: [`/forms/form-events`](/forms/form-events).

## Un formulario sin state {#a-form-with-no-state}

En un formulario grande, enlazar cada campo es mucho trabajo. Dale a cada campo un `name`, deja que el navegador guarde los valores y léelos todos a la vez:

```html title="Big.html"
<script>
  import { onMount } from "olum";

  const state = { data: {} };

  const collect = () => {
    const form = host.querySelector("form");
    const out = {};
    for (const [key, value] of new FormData(form).entries()) {
      const clean = value instanceof File ? value.name : value;
      if (key in out) out[key] = [].concat(out[key], clean);
      else out[key] = clean;
    }
    state.data = out;
  };

  onMount(collect);
</script>

<form oninput="collect()" onchange="collect()" onsubmit="(e) => { e.preventDefault(); collect() }">
  <input type="text" name="text" value="Eissa" />
  <select name="country">…</select>
  <input type="file" name="docs" multiple />
  <input type="hidden" name="source" value="kitchen-sink" />
  <button type="submit">Submit</button>
</form>
```

[`/forms/kitchen-sink`](/forms/kitchen-sink) tiene **todos** los tipos de campo en un formulario. Cópialo y borra lo que no necesites.

## Contenteditable {#contenteditable}

Un `<div>` editable no es un campo de formulario, así que enlázalo tú mismo. Lee `textContent` para texto plano o `innerHTML` para HTML:

```html title="Editable.html"
<div class="editor" contenteditable="true" oninput="(e) => state.title = e.target.textContent">{state.title}</div>

<div class="editor" contenteditable="true" html="state.note" oninput="(e) => state.note = e.target.innerHTML"></div>
```

La misma regla que con los inputs: **lo que escribe el usuario debe volver al state**. Si no, la siguiente actualización lo borra. Cuando el state y el contenido coinciden, no se reescribe nada, así que el cursor nunca salta.

:::warn
Mantén `{state.title}` pegado a las etiquetas de apertura y cierre, en una sola línea. Un salto de línea ahí se convierte en espacios reales en el texto.
:::

Ejemplo: [`/forms/contenteditable`](/forms/contenteditable).

## Llegar a un campo desde el código {#reaching-a-field-from-code}

Olum no tiene "refs". Usa [`host`](/docs/lifecycle#host), el propio elemento de este componente:

```js
const focusNickname = () => host.querySelector("[name=nickname]").focus();

const openPicker = () => host.querySelector("#picker").click();   // a hidden file input
```

El teclado, el foco, arrastrar y soltar y el portapapeles se explican en [Eventos](/docs/events).
