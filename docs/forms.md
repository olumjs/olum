---
title: Forms & Inputs
group: Template Syntax
order: 105
---

Every field is plain HTML — no `<Input>` wrapper, no form library. There are two ways to run a form, and you can mix them:

1. **Bind each field to state** — `value="{state.x}"` plus an event handler that writes back. Use it when the page reacts while the user types. The pattern itself is in [Two-way Binding](/docs/two-way-binding).
2. **Bind nothing** — give every control a `name`, let the DOM keep the values, and read them once with `new FormData(form)`. Use it for big forms that only matter on submit.

Every snippet below is a runnable example under `/forms/…`.

## Text-like inputs

`text`, `email`, `password`, `tel`, `url` and `search` all bind the same way — one small helper keeps it short:

```html title="Fields.html"
<script>
  const state = { text: "Eissa", email: "you@olumjs.top", password: "", reveal: false };

  const set = (key, e) => (state[key] = e.target.value);
</script>

<input type="text" name="text" value="{state.text}" oninput="set('text', $event)" maxlength="40" />
<input type="email" name="email" value="{state.email}" oninput="set('email', $event)" autocomplete="email" />

<!-- type is a normal string attribute, so it can be dynamic -->
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

<!-- never shown, still travels with the form -->
<input type="hidden" name="plan" value="{state.plan}" />

<input type="text" value="{state.text}" readonly />
<input type="text" value="not editable" disabled />
```

Every native attribute (`placeholder`, `maxlength`, `autocomplete`, `spellcheck`, `pattern`, …) keeps working as it does in HTML — see [`/forms/text-input-types`](/forms/text-input-types).

## Numbers and ranges

`e.target.value` is **always a string**. Cast it with a unary `+`:

```html title="Size.html"
<script>
  const state = { w: 4, h: 3 };
</script>

<input type="number" value="{state.w}" oninput="(e) => state.w = +e.target.value" min="0" max="10" />
<input type="range" value="{state.w}" oninput="(e) => state.w = +e.target.value" min="0" max="10" />

<p>area: {state.w} × {state.h} = {state.w * state.h}</p>
```

Two inputs can share one state key — move the range and the number field follows, and the other way round ([`/forms/numbers`](/forms/numbers)).

## Textarea

A `<textarea>` binds through `value=""`, like an input. If it also has text between its tags, `value` wins:

```html title="Editor.html"
<script>
  import { marked } from "marked";

  const state = { text: "Olum components are **plain HTML**" };
</script>

<textarea value="{state.text}" oninput="(e) => state.text = e.target.value"></textarea>

<div html="marked(state.text)"></div>
```

`html=""` prints the string **unescaped** — only do that with content you trust ([Escaping & Security](/docs/security)). Example: [`/forms/textarea`](/forms/textarea).

## Checkbox

Bind `checked`, read `e.target.checked` on `change`:

```html title="OptIn.html"
<label>
  <input type="checkbox" checked="{state.optIn}" onchange="(e) => state.optIn = e.target.checked" />
  Notify me about new Olum releases
</label>

<button disabled="{!state.optIn}">Sign up</button>
```

`disabled="{expr}"` is a [boolean attribute](/docs/attributes) — it is added when the expression is truthy and dropped when it is falsy. Example: [`/forms/checkboxes`](/forms/checkboxes).

## Radio group

Each radio compares against one shared key. Give them the same `name` so the browser groups them:

```html title="Slices.html"
<script>
  const state = { slices: 1 };
  const setSlices = (n) => (state.slices = n);
</script>

<label>
  <input type="radio" name="slices" checked="{state.slices === 1}" onchange="setSlices(1)" />
  One slice
</label>
<label>
  <input type="radio" name="slices" checked="{state.slices === 2}" onchange="setSlices(2)" />
  Two slices
</label>
```

## A group of checkboxes from a list

Write the group with [`<for>`](/docs/loops); the loop variable is available in the handler:

```html title="Toppings.html"
<script>
  const state = { toppings: ["Caramelized onions"], menu: ["Olives", "Caramelized onions", "Jalapeños"] };

  const toggleTopping = (topping, e) => {
    if (e.target.checked) state.toppings = state.toppings.concat(topping);
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

See [`/forms/radio-groups`](/forms/radio-groups).

## Select

Mark the current option with `selected="{expr}"` and read the choice in `onchange`:

```html title="Poll.html"
<select onchange="(e) => state.selected = state.questions[e.target.selectedIndex]">
  <for each="question of state.questions">
    <option value="{question.id}" selected="{state.selected && state.selected.id === question.id}">
      {question.text}
    </option>
  </for>
</select>
```

:::warn
`value="{expr}"` on the `<select>` element itself **does nothing at all** — put `selected="{expr}"` on the options.
:::

For `<select multiple>`, collect the chosen options yourself:

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

Examples: [`/forms/select`](/forms/select), [`/forms/multi-select`](/forms/multi-select).

## Optgroup

`<optgroup>` is normal markup, so it can come out of a loop too:

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

## Fieldset and legend

One `disabled` on the `<fieldset>` switches off **every** control inside it, and those controls stop being sent with the form:

```html title="Shipping.html"
<fieldset disabled="{!state.ship}">
  <legend>Shipping address</legend>
  <input name="street" value="{state.street}" oninput="set('street', $event)" />
  <input name="city" value="{state.city}" oninput="set('city', $event)" />
</fieldset>
```

Example: [`/forms/fieldset-optgroup`](/forms/fieldset-optgroup).

## Datalist and autocomplete

A `<datalist>` is a **suggestion** list — the user may still type anything else:

```html title="Fruit.html"
<input list="fruit-options" name="fruit" value="{state.fruit}" oninput="set('fruit', $event)" />

<datalist id="fruit-options">
  <for each="fruit of state.fruits">
    <option value="{fruit.name}">{fruit.note}</option>
  </for>
</datalist>
```

A `type="range"` can snap to a datalist too — give it `list="tick-options"` with `<option value="25" label="25">` entries ([`/forms/datalist-autocomplete`](/forms/datalist-autocomplete)).

## Date and time

`date`, `time`, `datetime-local`, `month` and `week` bind like any text input:

```html title="Dates.html"
<input type="date" name="date" value="{state.date}" oninput="set('date', $event)" min="2026-01-01" max="2026-12-31" />
<input type="time" name="time" value="{state.time}" oninput="set('time', $event)" step="900" />
<input type="datetime-local" name="datetime" value="{state.datetime}" oninput="set('datetime', $event)" />
<input type="month" value="{state.month}" oninput="set('month', $event)" />
<input type="week" value="{state.week}" oninput="set('week', $event)" />
```

:::note
The value is always a **string** (`"2026-08-17"`, `"09:30"`, `"2026-W34"`) — the browser never gives you a `Date`. Parse it yourself: `new Date(state.date + "T00:00:00")`.
:::

Example: [`/forms/date-time`](/forms/date-time).

## Color

A color input fires **both** events, and they mean different things:

```html title="Color.html"
<input
  type="color"
  value="{state.color}"
  oninput="(e) => state.color = e.target.value"
  onchange="(e) => state.committed = e.target.value"
/>
```

- `oninput` runs **while** the user drags inside the picker — use it for a live preview.
- `onchange` runs **once**, when the picker closes — use it to save.

Example: [`/forms/color-input`](/forms/color-input).

## File inputs

A file input's value can only be set by the user, so bind it **one way** — from the input into state:

```html title="Upload.html"
<input type="file" accept="image/png, image/jpeg" onchange="(e) => state.files = e.target.files" />
<input type="file" multiple onchange="(e) => state.files = e.target.files" />

<if when="state.files">
  <for each="file of Array.from(state.files)">
    <p>{file.name} ({file.size} bytes)</p>
  </for>
</if>
```

`state.files` is a `FileList`, not an array — wrap it in `Array.from()` to loop or map. Example: [`/forms/files`](/forms/files).

## Output, progress and meter

```html title="Meters.html"
<output for="a b" name="total">{total()}</output>

<progress value="{state.uploaded}" max="100"></progress>
<progress></progress>  <!-- no value attribute → spins forever -->

<meter value="{state.score}" min="0" max="100" low="30" high="70" optimum="100"></meter>
```

- `<output>` is a live result element; `for` tells assistive tech which inputs it comes from.
- `<progress>` is for a task that finishes. Drop the `value` attribute (with an [`<if>`](/docs/conditionals)) and it becomes indeterminate.
- `<meter>` is for a measurement, and colors itself from `low` / `high` / `optimum`.

Example: [`/forms/output-progress-meter`](/forms/output-progress-meter).

## Inputs inside a loop

Pass the loop index into the handler, then write a **new** array back:

```html title="Todos.html"
<script>
  const state = { todos: [{ done: false, text: "skim the Olum docs" }] };

  const toggleDone = (index, e) => {
    const next = Array.from(state.todos);
    next[index].done = e.target.checked;
    state.todos = next;
  };

  const setText = (index, e) => {
    const next = Array.from(state.todos);
    next[index].text = e.target.value;
    state.todos = next;
  };
</script>

<for each="(todo, index) of state.todos">
  <div>
    <input type="checkbox" checked="{todo.done}" onchange="toggleDone(index, $event)" />
    <input value="{todo.text}" oninput="setText(index, $event)" disabled="{todo.done}" />
  </div>
</for>
```

Typing in one row does not disturb the others: a field is only rewritten when its own value changed, and the caret is kept ([Rendering & Updates](/docs/rendering)). Example: [`/forms/loop-inputs`](/forms/loop-inputs).

## Validation

The browser already validates `required`, `pattern`, `min`, `max`, `minlength`, `type="email"` and friends. `oninvalid` lets you print the message yourself:

```html title="Signup.html"
<script>
  const state = { user: "", errors: {} };

  const onInvalid = (e) => {
    e.preventDefault();                       // stop the native bubble
    state.errors = { ...state.errors, [e.target.name]: e.target.validationMessage };
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

For a rule no attribute can express — "the two passwords match" — use `setCustomValidity`. An **empty string** means valid:

```js
const setConfirm = (e) => {
  const field = e.target;
  field.setCustomValidity(field.value === state.pass ? "" : "The two passwords do not match");
  state.confirm = field.value;
};
```

`novalidate="{expr}"` on the form is a [boolean attribute](/docs/attributes), so it can be toggled from state; `formnovalidate` on one button skips the checks for that button only. Example: [`/forms/validation`](/forms/validation).

## Form events

`input` and `change` **bubble**, so one listener on the `<form>` covers every field inside it:

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
  e.preventDefault();                    // always — there is no page reload in a SPA
  const who = e.submitter ? e.submitter.value : "(keyboard)";   // which button sent it
  const data = new FormData(e.target);
  state.submitted = {
    name: data.get("name"),
    topics: data.getAll("topics"),       // many checkboxes, one name
  };
};

const handleFormData = (e) => {
  e.formData.append("stamp", new Date().toISOString());   // last chance to add fields
};
```

- `e.submitter` is the button that sent the form (`<button type="submit" value="publish">`).
- `data.getAll(name)` returns every value when several controls share one `name`.
- `formdata` fires whenever `new FormData(form)` runs.
- `<button type="button">` never submits — use it for plain actions inside a form.

Example: [`/forms/form-events`](/forms/form-events).

## A whole form with no state

For a large form, binding every field is busywork. Give each control a `name`, keep the values in the DOM, and read them all at once:

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

[`/forms/kitchen-sink`](/forms/kitchen-sink) is one form with **every** field type in it — copy the file and delete what you do not need.

## Contenteditable

An editable `<div>` is not a form field, so bind it by hand. Read `textContent` for plain text, `innerHTML` for markup:

```html title="Editable.html"
<div class="editor" contenteditable="true" oninput="(e) => state.title = e.target.textContent">{state.title}</div>

<div class="editor" contenteditable="true" html="state.note" oninput="(e) => state.note = e.target.innerHTML"></div>
```

The rule is the same as for inputs: **what the user types must land back in state**, because the template is the source of truth on every re-render. When state and the live content agree the patcher writes nothing, so the caret never jumps — but leave the editable out of state and the next re-render wipes it.

:::warn
Keep `{state.title}` tight against the opening and closing tag, on one line. A newline between them becomes real whitespace inside the editable text.
:::

Example: [`/forms/contenteditable`](/forms/contenteditable).

## Reaching a field directly

There are no refs in Olum. Query inside [`host`](/docs/lifecycle) instead:

```js
const focusNickname = () => host.querySelector("[name=nickname]").focus();

const openPicker = () => host.querySelector("#picker").click();   // a hidden file input
```

Keyboard, focus, drag-and-drop and clipboard handling live in [Events](/docs/events).
