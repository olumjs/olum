---
title: Forms & Inputs
group: Template Syntax
order: 130
---

Every field is plain HTML. No wrapper components, no form library. There are two ways to handle a form, and you can mix them:

1. **Bind each field to state** with `value="{state.x}"` plus an event that writes back ([Two-way Binding](/docs/two-way-binding)). Use it when the page should react while the user types.
2. **Bind nothing.** Give each field a `name` and read all values at once with `new FormData(form)` ([see below](#a-form-with-no-state)). Good for big forms that only matter on submit.

Most sections link to a runnable example under `/forms/…`.

## Text-like inputs

`text`, `email`, `password`, `tel`, `url` and `search` all bind the same way. A small helper keeps it short:

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

All normal HTML attributes (`placeholder`, `maxlength`, `autocomplete`, `spellcheck`, `pattern`, …) work as usual. Example: [`/forms/text-input-types`](/forms/text-input-types).

## Numbers and ranges

`e.target.value` is **always a string**. Turn it into a number with `+`:

```html title="Size.html"
<script>
  const state = { w: 4, h: 3 };
</script>

<input type="number" value="{state.w}" oninput="(e) => state.w = +e.target.value" min="0" max="10" />
<input type="range" value="{state.w}" oninput="(e) => state.w = +e.target.value" min="0" max="10" />

<p>area: {state.w} × {state.h} = {state.w * state.h}</p>
```

Both inputs use the same key, so moving one moves the other. Example: [`/forms/numbers`](/forms/numbers).

## Textarea

Binds with `value=""`, like an input. If it also has text between its tags, `value` wins:

```html title="Editor.html"
<script>
  import { marked } from "marked";

  const state = { text: "Olum components are **plain HTML**" };
</script>

<textarea value="{state.text}" oninput="(e) => state.text = e.target.value"></textarea>

<div html="marked(state.text)"></div>
```

`html=""` shows the string as **real HTML**. Only use it with content you trust ([Escaping & Security](/docs/security)). Example: [`/forms/textarea`](/forms/textarea).

## Checkbox and radio

See [Two-way Binding](/docs/two-way-binding#checkbox). For a **list of checkboxes**, use [`<for>`](/docs/loops). The loop variable is available in the handler:

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

Example: [`/forms/radio-groups`](/forms/radio-groups).

## Select

Single select: see [Two-way Binding](/docs/two-way-binding#select). Remember: `value` on `<select>` does nothing, put `selected` on the options.

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

`<optgroup>` is normal HTML, so it can come from a loop too:

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

Examples: [`/forms/select`](/forms/select), [`/forms/multi-select`](/forms/multi-select).

## Fieldset

One `disabled` on a `<fieldset>` turns off **every** field inside it, and those fields are no longer sent with the form:

```html title="Shipping.html"
<fieldset disabled="{!state.ship}">
  <legend>Shipping address</legend>
  <input name="street" value="{state.street}" oninput="set('street', $event)" />
  <input name="city" value="{state.city}" oninput="set('city', $event)" />
</fieldset>
```

Example: [`/forms/fieldset-optgroup`](/forms/fieldset-optgroup).

## Datalist (suggestions)

A `<datalist>` only **suggests** values. The user can still type anything:

```html title="Fruit.html"
<input list="fruit-options" name="fruit" value="{state.fruit}" oninput="set('fruit', $event)" />

<datalist id="fruit-options">
  <for each="fruit of state.fruits">
    <option value="{fruit.name}">{fruit.note}</option>
  </for>
</datalist>
```

A `type="range"` can snap to a datalist too: give it `list="tick-options"` with `<option value="25" label="25">` entries. Example: [`/forms/datalist-autocomplete`](/forms/datalist-autocomplete).

## Date and time

`date`, `time`, `datetime-local`, `month` and `week` bind like text:

```html title="Dates.html"
<input type="date" name="date" value="{state.date}" oninput="set('date', $event)" min="2026-01-01" max="2026-12-31" />
<input type="time" name="time" value="{state.time}" oninput="set('time', $event)" step="900" />
<input type="datetime-local" name="datetime" value="{state.datetime}" oninput="set('datetime', $event)" />
<input type="month" value="{state.month}" oninput="set('month', $event)" />
<input type="week" value="{state.week}" oninput="set('week', $event)" />
```

:::note
The value is always a **string** (`"2026-08-17"`, `"09:30"`, `"2026-W34"`), never a `Date`. To get a `Date`: `new Date(state.date + "T00:00:00")`.
:::

Example: [`/forms/date-time`](/forms/date-time).

## Color

A color input fires **two** events with different meanings:

```html title="Color.html"
<input
  type="color"
  value="{state.color}"
  oninput="(e) => state.color = e.target.value"
  onchange="(e) => state.committed = e.target.value"
/>
```

- `oninput` runs **while** the user drags in the picker. Use it for a live preview.
- `onchange` runs **once**, when the picker closes. Use it to save.

Example: [`/forms/color-input`](/forms/color-input).

## File inputs

Only the user can set a file input's value, so bind it **one way**, from the input into state:

```html title="Upload.html"
<input type="file" accept="image/png, image/jpeg" onchange="(e) => state.files = e.target.files" />
<input type="file" multiple onchange="(e) => state.files = e.target.files" />

<if when="state.files">
  <for each="file of Array.from(state.files)">
    <p>{file.name} ({file.size} bytes)</p>
  </for>
</if>
```

`state.files` is a `FileList`, not an array. Wrap it in `Array.from()` to loop or `map` over it. Example: [`/forms/files`](/forms/files).

## Output, progress and meter

```html title="Meters.html"
<output for="a b" name="total">{total()}</output>

<progress value="{state.uploaded}" max="100"></progress>
<progress></progress>  <!-- no value → endless "loading" animation -->

<meter value="{state.score}" min="0" max="100" low="30" high="70" optimum="100"></meter>
```

- `<output>` shows a result. `for` tells screen readers which inputs it comes from.
- `<progress>` is for a task that finishes. Without `value` (remove it with [`<if>`](/docs/conditionals)), it shows an endless animation.
- `<meter>` shows a measurement and colors itself using `low` / `high` / `optimum`.

Example: [`/forms/output-progress-meter`](/forms/output-progress-meter).

## Inputs inside a loop

Pass the index to the handler and change that item:

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

Typing in one row doesn't disturb the others: a field only changes when its own value changed, and the cursor stays. Example: [`/forms/loop-inputs`](/forms/loop-inputs).

## Validation

The browser already checks `required`, `pattern`, `min`, `max`, `minlength`, `type="email"` and so on. Use `oninvalid` to show the message your own way:

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

- `novalidate="{…}"` on the form is a [boolean attribute](/docs/attributes#boolean-attributes), so state can turn checks on and off.
- `formnovalidate` on a button skips the checks for that button only.

For a rule no attribute can express (like "both passwords match"), use `setCustomValidity`. An **empty string** means valid:

```js
const setConfirm = (e) => {
  const field = e.target;
  field.setCustomValidity(field.value === state.pass ? "" : "The two passwords do not match");
  state.confirm = field.value;
};
```

Example: [`/forms/validation`](/forms/validation).

## Form events

`input` and `change` **bubble up**, so one listener on the `<form>` covers all its fields:

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

- `e.submitter` is the button that sent the form (`<button type="submit" value="publish">`).
- `data.getAll(name)` returns all values when several fields share a `name`.
- `formdata` fires whenever `new FormData(form)` runs.
- `<button type="button">` never submits. Use it for other actions inside a form.

Example: [`/forms/form-events`](/forms/form-events).

## A form with no state

For a big form, binding every field is a lot of work. Give each field a `name`, let the browser hold the values, and read them all at once:

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

[`/forms/kitchen-sink`](/forms/kitchen-sink) has **every** field type in one form. Copy it and delete what you don't need.

## Contenteditable

An editable `<div>` isn't a form field, so bind it yourself. Read `textContent` for plain text or `innerHTML` for HTML:

```html title="Editable.html"
<div class="editor" contenteditable="true" oninput="(e) => state.title = e.target.textContent">{state.title}</div>

<div class="editor" contenteditable="true" html="state.note" oninput="(e) => state.note = e.target.innerHTML"></div>
```

Same rule as inputs: **what the user types must go back into state**. If it doesn't, the next update wipes it. When state and the content match, nothing is rewritten, so the cursor never jumps.

:::warn
Keep `{state.title}` right against the opening and closing tags, on one line. A line break there becomes real spaces in the text.
:::

Example: [`/forms/contenteditable`](/forms/contenteditable).

## Reaching a field from code

Olum has no "refs". Use [`host`](/docs/lifecycle#host), this component's own element:

```js
const focusNickname = () => host.querySelector("[name=nickname]").focus();

const openPicker = () => host.querySelector("#picker").click();   // a hidden file input
```

Keyboard, focus, drag-and-drop and clipboard are covered in [Events](/docs/events).
