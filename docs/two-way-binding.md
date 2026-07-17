---
title: Two-way Binding
group: Template Syntax
order: 100
---

There is no `model` attribute — every binding is the same manual pair: a **value-ish attribute** reading from state, plus an **event handler** writing back.

## Text, textarea, number

```html title="Component.html"
<input value="{state.text}" oninput="(e) => state.text = e.target.value" />

<!-- textarea binds through value="" too (not through its children) -->
<textarea value="{state.text}" oninput="(e) => state.text = e.target.value"></textarea>

<!-- e.target.value is always a string — cast numbers with a unary + -->
<input type="number" value="{state.n}" oninput="(e) => state.n = +e.target.value" />
<input type="range" value="{state.n}" oninput="(e) => state.n = +e.target.value" min="0" max="10" />
```

## Checkbox

Bind `checked`, read `e.target.checked` on `change`:

```html title="Component.html"
<input type="checkbox" checked="{state.yes}" onchange="(e) => state.yes = e.target.checked" />
```

## Radio group

Each radio's `checked` compares against the shared state; the handler sets it:

```html title="Component.html"
<label>
  <input type="radio" name="scoops" checked="{state.scoops === 1}" onchange="setScoops(1)" />
  One scoop
</label>
<label>
  <input type="radio" name="scoops" checked="{state.scoops === 2}" onchange="setScoops(2)" />
  Two scoops
</label>
```

## Select

Mark the current `<option>` with `selected="{expr}"` and read the choice in `onchange`:

```html title="Component.html"
<select onchange="(e) => state.color = e.target.value">
  <option value="red" selected="{state.color === 'red'}">red</option>
  <option value="green" selected="{state.color === 'green'}">green</option>
</select>

<!-- works with a loop too; e.target.selectedIndex maps back to the array -->
<select onchange="(e) => state.selected = state.questions[e.target.selectedIndex]">
  <for each="question of state.questions">
    <option value="{question.id}" selected="{state.selected && state.selected.id === question.id}">
      {question.text}
    </option>
  </for>
</select>
```

:::warn
`value="{expr}"` on the `<select>` element itself **silently does nothing** — always put `selected="{expr}"` on the options instead.
:::

For `<select multiple>`, collect the chosen options from `e.target.options`:

```html title="Component.html"
<select multiple onchange="onSelectFlavours($event)">
  <for each="flavour of menu">
    <option value="{flavour}" selected="{state.flavours.includes(flavour)}">{flavour}</option>
  </for>
</select>
```

```js
const onSelectFlavours = (e) => {
  state.flavours = Array.from(e.target.options)
    .filter((o) => o.selected)
    .map((o) => o.value);
};
```

## File inputs

A file input's value can only be set by the user — bind one-way, from the input into state:

```html title="Component.html"
<input type="file" multiple onchange="(e) => state.files = e.target.files" />

<if when="state.files">
  <for each="file of Array.from(state.files)">
    <p>{file.name} ({file.size} bytes)</p>
  </for>
</if>
```

Note that `state.files` is a `FileList`, not an array — wrap it in `Array.from()` to loop or map.
