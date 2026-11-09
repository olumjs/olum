---
title: Formulários e inputs
group: Sintaxe de templates
order: 130
source: 1055d001b2a5
---

Todo campo é HTML comum. Sem componentes wrapper, sem biblioteca de formulários. Há duas formas de lidar com um formulário, e você pode misturá-las:

1. **Faça o binding de cada campo ao state** com `value="{state.x}"` mais um evento que escreve de volta ([Binding bidirecional](/docs/two-way-binding)). Use quando a página precisa reagir enquanto o usuário digita.
2. **Não faça binding de nada.** Dê a cada campo um `name` e leia todos os valores de uma vez com `new FormData(form)` ([veja abaixo](#a-form-with-no-state)). Bom para formulários grandes que só importam no envio.

A maioria das seções tem link para um exemplo executável em `/forms/…`.

## Inputs de texto {#text-like-inputs}

`text`, `email`, `password`, `tel`, `url` e `search` fazem binding do mesmo jeito. Um pequeno helper deixa o código mais curto:

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

Todos os atributos HTML normais (`placeholder`, `maxlength`, `autocomplete`, `spellcheck`, `pattern`, …) funcionam normalmente. Exemplo: [`/forms/text-input-types`](/forms/text-input-types).

## Números e intervalos {#numbers-and-ranges}

`e.target.value` é **sempre uma string**. Transforme em número com `+`:

```html title="Size.html"
<script>
  const state = { w: 4, h: 3 };
</script>

<input type="number" value="{state.w}" oninput="(e) => state.w = +e.target.value" min="0" max="10" />
<input type="range" value="{state.w}" oninput="(e) => state.w = +e.target.value" min="0" max="10" />

<p>area: {state.w} × {state.h} = {state.w * state.h}</p>
```

Os dois inputs usam a mesma chave, então mexer em um mexe no outro. Exemplo: [`/forms/numbers`](/forms/numbers).

## Textarea {#textarea}

Faz binding com `value=""`, como um input. Se ele também tiver texto entre as tags, o `value` vence:

```html title="Editor.html"
<script>
  import { marked } from "marked";

  const state = { text: "Olum components are **plain HTML**" };
</script>

<textarea value="{state.text}" oninput="(e) => state.text = e.target.value"></textarea>

<div html="marked(state.text)"></div>
```

`html=""` mostra a string como **HTML de verdade**. Use só com conteúdo em que você confia ([Escape e segurança](/docs/security)). Exemplo: [`/forms/textarea`](/forms/textarea).

## Checkbox e rádio {#checkbox-and-radio}

Veja [Binding bidirecional](/docs/two-way-binding#checkbox). Para uma **lista de checkboxes**, use [`<for>`](/docs/loops). A variável do loop está disponível no handler:

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

Exemplo: [`/forms/radio-groups`](/forms/radio-groups).

## Select {#select}

Seleção única: veja [Binding bidirecional](/docs/two-way-binding#select). Lembre-se: `value` no `<select>` não faz nada, coloque `selected` nas options.

Para `<select multiple>`, junte você mesmo as options escolhidas:

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

`<optgroup>` é HTML comum, então também pode vir de um loop:

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

Exemplos: [`/forms/select`](/forms/select), [`/forms/multi-select`](/forms/multi-select).

## Fieldset {#fieldset}

Um único `disabled` em um `<fieldset>` desativa **todos** os campos dentro dele, e esses campos deixam de ser enviados com o formulário:

```html title="Shipping.html"
<fieldset disabled="{!state.ship}">
  <legend>Shipping address</legend>
  <input name="street" value="{state.street}" oninput="set('street', $event)" />
  <input name="city" value="{state.city}" oninput="set('city', $event)" />
</fieldset>
```

Exemplo: [`/forms/fieldset-optgroup`](/forms/fieldset-optgroup).

## Datalist (sugestões) {#datalist-suggestions}

Um `<datalist>` só **sugere** valores. O usuário ainda pode digitar qualquer coisa:

```html title="Fruit.html"
<input list="fruit-options" name="fruit" value="{state.fruit}" oninput="set('fruit', $event)" />

<datalist id="fruit-options">
  <for each="fruit of state.fruits">
    <option value="{fruit.name}">{fruit.note}</option>
  </for>
</datalist>
```

Um `type="range"` também pode se encaixar em um datalist: dê a ele `list="tick-options"` com entradas `<option value="25" label="25">`. Exemplo: [`/forms/datalist-autocomplete`](/forms/datalist-autocomplete).

## Data e hora {#date-and-time}

`date`, `time`, `datetime-local`, `month` e `week` fazem binding como texto:

```html title="Dates.html"
<input type="date" name="date" value="{state.date}" oninput="set('date', $event)" min="2026-01-01" max="2026-12-31" />
<input type="time" name="time" value="{state.time}" oninput="set('time', $event)" step="900" />
<input type="datetime-local" name="datetime" value="{state.datetime}" oninput="set('datetime', $event)" />
<input type="month" value="{state.month}" oninput="set('month', $event)" />
<input type="week" value="{state.week}" oninput="set('week', $event)" />
```

:::note
O valor é sempre uma **string** (`"2026-08-17"`, `"09:30"`, `"2026-W34"`), nunca um `Date`. Para obter um `Date`: `new Date(state.date + "T00:00:00")`.
:::

Exemplo: [`/forms/date-time`](/forms/date-time).

## Cor {#color}

Um input de cor dispara **dois** eventos com significados diferentes:

```html title="Color.html"
<input
  type="color"
  value="{state.color}"
  oninput="(e) => state.color = e.target.value"
  onchange="(e) => state.committed = e.target.value"
/>
```

- `oninput` roda **enquanto** o usuário arrasta no seletor. Use para uma prévia ao vivo.
- `onchange` roda **uma vez**, quando o seletor fecha. Use para salvar.

Exemplo: [`/forms/color-input`](/forms/color-input).

## Inputs de arquivo {#file-inputs}

Só o usuário pode definir o valor de um input de arquivo, então faça o binding em **um só sentido**, do input para o state:

```html title="Upload.html"
<input type="file" accept="image/png, image/jpeg" onchange="(e) => state.files = e.target.files" />
<input type="file" multiple onchange="(e) => state.files = e.target.files" />

<if when="state.files">
  <for each="file of Array.from(state.files)">
    <p>{file.name} ({file.size} bytes)</p>
  </for>
</if>
```

`state.files` é um `FileList`, não um array. Envolva em `Array.from()` para percorrer ou usar `map`. Exemplo: [`/forms/files`](/forms/files).

## Output, progress e meter {#output-progress-and-meter}

```html title="Meters.html"
<output for="a b" name="total">{total()}</output>

<progress value="{state.uploaded}" max="100"></progress>
<progress></progress>  <!-- no value → endless "loading" animation -->

<meter value="{state.score}" min="0" max="100" low="30" high="70" optimum="100"></meter>
```

- `<output>` mostra um resultado. `for` diz aos leitores de tela de quais inputs ele vem.
- `<progress>` é para uma tarefa que termina. Sem `value` (remova-o com [`<if>`](/docs/conditionals)), ele mostra uma animação sem fim.
- `<meter>` mostra uma medida e se colore sozinho usando `low` / `high` / `optimum`.

Exemplo: [`/forms/output-progress-meter`](/forms/output-progress-meter).

## Inputs dentro de um loop {#inputs-inside-a-loop}

Passe o índice para o handler e mude aquele item:

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

Digitar em uma linha não atrapalha as outras: um campo só muda quando o seu próprio valor mudou, e o cursor fica no lugar. Exemplo: [`/forms/loop-inputs`](/forms/loop-inputs).

## Validação {#validation}

O navegador já verifica `required`, `pattern`, `min`, `max`, `minlength`, `type="email"` e assim por diante. Use `oninvalid` para mostrar a mensagem do seu jeito:

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

- `novalidate="{…}"` no formulário é um [atributo booleano](/docs/attributes#boolean-attributes), então o state pode ligar e desligar as verificações.
- `formnovalidate` em um botão pula as verificações só para aquele botão.

Para uma regra que nenhum atributo consegue expressar (como "as duas senhas são iguais"), use `setCustomValidity`. Uma **string vazia** significa válido:

```js
const setConfirm = (e) => {
  const field = e.target;
  field.setCustomValidity(field.value === state.pass ? "" : "The two passwords do not match");
  state.confirm = field.value;
};
```

Exemplo: [`/forms/validation`](/forms/validation).

## Eventos de formulário {#form-events}

`input` e `change` **propagam**, então um único listener no `<form>` cobre todos os seus campos:

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

- `e.submitter` é o botão que enviou o formulário (`<button type="submit" value="publish">`).
- `data.getAll(name)` retorna todos os valores quando vários campos compartilham um `name`.
- `formdata` dispara sempre que `new FormData(form)` roda.
- `<button type="button">` nunca envia. Use para outras ações dentro de um formulário.

Exemplo: [`/forms/form-events`](/forms/form-events).

## Um formulário sem state {#a-form-with-no-state}

Em um formulário grande, fazer o binding de cada campo dá muito trabalho. Dê a cada campo um `name`, deixe o navegador guardar os valores e leia todos de uma vez:

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

[`/forms/kitchen-sink`](/forms/kitchen-sink) tem **todos** os tipos de campo em um formulário. Copie e apague o que você não precisa.

## Contenteditable {#contenteditable}

Um `<div>` editável não é um campo de formulário, então faça o binding você mesmo. Leia `textContent` para texto simples ou `innerHTML` para HTML:

```html title="Editable.html"
<div class="editor" contenteditable="true" oninput="(e) => state.title = e.target.textContent">{state.title}</div>

<div class="editor" contenteditable="true" html="state.note" oninput="(e) => state.note = e.target.innerHTML"></div>
```

Mesma regra dos inputs: **o que o usuário digita precisa voltar para o state**. Se não voltar, a próxima atualização apaga. Quando o state e o conteúdo batem, nada é reescrito, então o cursor nunca pula.

:::warn
Mantenha `{state.title}` colado nas tags de abertura e fechamento, em uma linha só. Uma quebra de linha ali vira espaços de verdade no texto.
:::

Exemplo: [`/forms/contenteditable`](/forms/contenteditable).

## Alcançando um campo pelo código {#reaching-a-field-from-code}

O Olum não tem "refs". Use [`host`](/docs/lifecycle#host), o próprio elemento deste componente:

```js
const focusNickname = () => host.querySelector("[name=nickname]").focus();

const openPicker = () => host.querySelector("#picker").click();   // a hidden file input
```

Teclado, foco, arrastar e soltar e área de transferência são explicados em [Eventos](/docs/events).
