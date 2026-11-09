---
title: Binding bidirecional
group: Sintaxe de templates
order: 120
source: efc695f8c242
---

O Olum não tem um atributo `model`. Para ligar um input ao state, você escreve duas coisas:

1. um atributo que **lê** do state (`value`, `checked`, `selected`)
2. um evento que **escreve** de volta no state (`oninput`, `onchange`)

```html title="Component.html"
<input value="{state.text}" oninput="(e) => state.text = e.target.value" />
```

Esse é o padrão inteiro. Mais tipos de campo (data, cor, arquivo, validação, `FormData`, …) estão em [Formulários e inputs](/docs/forms).

Uma atualização nunca apaga o que o usuário está digitando: o input só muda quando o valor dele no template mudou, e o cursor fica no lugar. Veja [Renderização e atualizações](/docs/rendering#inputs-are-never-reset-by-accident).

## Texto, textarea, número {#text-textarea-number}

```html title="Component.html"
<input value="{state.text}" oninput="(e) => state.text = e.target.value" />

<!-- textarea uses value="" too (if it also has text inside, value wins) -->
<textarea value="{state.text}" oninput="(e) => state.text = e.target.value"></textarea>

<!-- e.target.value is always a string: turn it into a number with + -->
<input type="number" value="{state.n}" oninput="(e) => state.n = +e.target.value" />
<input type="range" value="{state.n}" oninput="(e) => state.n = +e.target.value" min="0" max="10" />
```

## Checkbox {#checkbox}

Faça o binding de `checked` e leia `e.target.checked` no `change`:

```html title="Component.html"
<input type="checkbox" checked="{state.yes}" onchange="(e) => state.yes = e.target.checked" />

<button disabled="{!state.yes}">Sign up</button>
```

`checked` e `disabled` são [atributos booleanos](/docs/attributes#boolean-attributes): adicionados quando o valor é verdadeiro, removidos quando é falso. Exemplo: [`/forms/checkboxes`](/forms/checkboxes).

## Botões de rádio {#radio-buttons}

Cada rádio verifica se bate com o valor compartilhado. Dê a todos o mesmo `name` para que o navegador os agrupe:

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

## Select {#select}

Coloque `selected="{…}"` na `<option>` certa e leia a escolha no `onchange`:

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
`value="{…}"` no próprio `<select>` **não faz nada**. Sempre coloque `selected="{…}"` nas options.
:::

Para seleção múltipla e inputs de arquivo, veja [Formulários e inputs](/docs/forms).
