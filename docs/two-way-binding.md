---
title: Two-way Binding
group: Template Syntax
order: 120
---

Olum has no `model` attribute. To connect an input to state, you write two things:

1. an attribute that **reads** from state (`value`, `checked`, `selected`)
2. an event that **writes** back to state (`oninput`, `onchange`)

```html title="Component.html"
<input value="{state.text}" oninput="(e) => state.text = e.target.value" />
```

That's the whole pattern. More field types (date, color, file, validation, `FormData`, …) are in [Forms & Inputs](/docs/forms).

An update never wipes what the user is typing: the input is only changed when its value in the template changed, and the cursor stays in place. See [Rendering & Updates](/docs/rendering#inputs-are-never-reset-by-accident).

## Text, textarea, number

```html title="Component.html"
<input value="{state.text}" oninput="(e) => state.text = e.target.value" />

<!-- textarea uses value="" too (if it also has text inside, value wins) -->
<textarea value="{state.text}" oninput="(e) => state.text = e.target.value"></textarea>

<!-- e.target.value is always a string: turn it into a number with + -->
<input type="number" value="{state.n}" oninput="(e) => state.n = +e.target.value" />
<input type="range" value="{state.n}" oninput="(e) => state.n = +e.target.value" min="0" max="10" />
```

## Checkbox

Bind `checked`, and read `e.target.checked` on `change`:

```html title="Component.html"
<input type="checkbox" checked="{state.yes}" onchange="(e) => state.yes = e.target.checked" />

<button disabled="{!state.yes}">Sign up</button>
```

`checked` and `disabled` are [boolean attributes](/docs/attributes#boolean-attributes): added when the value is truthy, removed when falsy. Example: [`/forms/checkboxes`](/forms/checkboxes).

## Radio buttons

Each radio checks if it matches the shared value. Give them the same `name` so the browser groups them:

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

Put `selected="{…}"` on the right `<option>`, and read the choice in `onchange`:

```html title="Component.html"
<select onchange="(e) => state.color = e.target.value">
  <option value="red" selected="{state.color === 'red'}">red</option>
  <option value="green" selected="{state.color === 'green'}">green</option>
</select>

<!-- with a loop: e.target.selectedIndex is the position in the array -->
<select onchange="(e) => state.selected = state.questions[e.target.selectedIndex]">
  <for each="question of state.questions">
    <option value="{question.id}" selected="{state.selected && state.selected.id === question.id}">
      {question.text}
    </option>
  </for>
</select>
```

:::warn
`value="{…}"` on the `<select>` itself **does nothing**. Always put `selected="{…}"` on the options.
:::

For multi-select and file inputs, see [Forms & Inputs](/docs/forms).
