---
title: フォームと入力
group: テンプレート構文
order: 130
source: 1055d001b2a5
---

どの入力欄も普通の HTML です。ラッパーのコンポーネントも、フォームのライブラリもありません。フォームの扱い方は 2 通りあり、組み合わせることもできます：

1. **各入力欄をステートにバインドする**：`value="{state.x}"` と、値を書き戻すイベントを使います（[双方向バインディング](/docs/two-way-binding)）。ユーザーの入力中にページを反応させたいときに使います。
2. **何もバインドしない**：各入力欄に `name` を付け、`new FormData(form)` ですべての値を一度に読み取ります（[下記参照](#a-form-with-no-state)）。送信時にしか値が必要ない大きなフォームに向いています。

ほとんどのセクションには、`/forms/…` 以下の動く例へのリンクがあります。

## テキスト系の入力欄 {#text-like-inputs}

`text`、`email`、`password`、`tel`、`url`、`search` はどれも同じ方法でバインドします。小さなヘルパーを使えば短く書けます：

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

通常の HTML 属性（`placeholder`、`maxlength`、`autocomplete`、`spellcheck`、`pattern` など）はすべて普段どおり使えます。例：[`/forms/text-input-types`](/forms/text-input-types)。

## 数値と範囲 {#numbers-and-ranges}

`e.target.value` は**常に文字列**です。`+` で数値に変換します：

```html title="Size.html"
<script>
  const state = { w: 4, h: 3 };
</script>

<input type="number" value="{state.w}" oninput="(e) => state.w = +e.target.value" min="0" max="10" />
<input type="range" value="{state.w}" oninput="(e) => state.w = +e.target.value" min="0" max="10" />

<p>area: {state.w} × {state.h} = {state.w * state.h}</p>
```

どちらの入力欄も同じキーを使っているので、一方を動かすともう一方も動きます。例：[`/forms/numbers`](/forms/numbers)。

## Textarea {#textarea}

入力欄と同じく `value=""` でバインドします。タグの間にもテキストがある場合は、`value` が優先されます：

```html title="Editor.html"
<script>
  import { marked } from "marked";

  const state = { text: "Olum components are **plain HTML**" };
</script>

<textarea value="{state.text}" oninput="(e) => state.text = e.target.value"></textarea>

<div html="marked(state.text)"></div>
```

`html=""` は文字列を**本物の HTML** として表示します。信頼できる内容にだけ使ってください（[エスケープとセキュリティ](/docs/security)）。例：[`/forms/textarea`](/forms/textarea)。

## チェックボックスとラジオボタン {#checkbox-and-radio}

[双方向バインディング](/docs/two-way-binding#checkbox)を参照してください。**チェックボックスの一覧**には [`<for>`](/docs/loops) を使います。ループ変数はハンドラの中で使えます：

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

例：[`/forms/radio-groups`](/forms/radio-groups)。

## セレクト {#select}

単一選択：[双方向バインディング](/docs/two-way-binding#select)を参照してください。覚えておきましょう：`<select>` の `value` は何もしないので、option に `selected` を付けます。

`<select multiple>` では、選ばれた option を自分で集めます：

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

`<optgroup>` は普通の HTML なので、これもループから作れます：

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

例：[`/forms/select`](/forms/select)、[`/forms/multi-select`](/forms/multi-select)。

## Fieldset {#fieldset}

`<fieldset>` に `disabled` を 1 つ付けるだけで、中の**すべての**入力欄が無効になり、それらの入力欄はフォームと一緒に送信されなくなります：

```html title="Shipping.html"
<fieldset disabled="{!state.ship}">
  <legend>Shipping address</legend>
  <input name="street" value="{state.street}" oninput="set('street', $event)" />
  <input name="city" value="{state.city}" oninput="set('city', $event)" />
</fieldset>
```

例：[`/forms/fieldset-optgroup`](/forms/fieldset-optgroup)。

## Datalist（候補） {#datalist-suggestions}

`<datalist>` は値を**提案する**だけです。ユーザーは何でも入力できます：

```html title="Fruit.html"
<input list="fruit-options" name="fruit" value="{state.fruit}" oninput="set('fruit', $event)" />

<datalist id="fruit-options">
  <for each="fruit of state.fruits">
    <option value="{fruit.name}">{fruit.note}</option>
  </for>
</datalist>
```

`type="range"` も datalist の目盛りに吸着させられます：`list="tick-options"` を指定し、`<option value="25" label="25">` のような項目を書きます。例：[`/forms/datalist-autocomplete`](/forms/datalist-autocomplete)。

## 日付と時刻 {#date-and-time}

`date`、`time`、`datetime-local`、`month`、`week` はテキストと同じようにバインドします：

```html title="Dates.html"
<input type="date" name="date" value="{state.date}" oninput="set('date', $event)" min="2026-01-01" max="2026-12-31" />
<input type="time" name="time" value="{state.time}" oninput="set('time', $event)" step="900" />
<input type="datetime-local" name="datetime" value="{state.datetime}" oninput="set('datetime', $event)" />
<input type="month" value="{state.month}" oninput="set('month', $event)" />
<input type="week" value="{state.week}" oninput="set('week', $event)" />
```

:::note
値は常に**文字列**（`"2026-08-17"`、`"09:30"`、`"2026-W34"`）で、`Date` にはなりません。`Date` が欲しい場合は：`new Date(state.date + "T00:00:00")`。
:::

例：[`/forms/date-time`](/forms/date-time)。

## 色 {#color}

色の入力欄は、意味の異なる**2 つの**イベントを発火します：

```html title="Color.html"
<input
  type="color"
  value="{state.color}"
  oninput="(e) => state.color = e.target.value"
  onchange="(e) => state.committed = e.target.value"
/>
```

- `oninput` は、ユーザーがピッカーの中でドラッグしている**間**に実行されます。ライブプレビューに使います。
- `onchange` は、ピッカーが閉じたときに **1 回だけ**実行されます。保存に使います。

例：[`/forms/color-input`](/forms/color-input)。

## ファイル入力 {#file-inputs}

ファイル入力の値を設定できるのはユーザーだけなので、入力欄からステートへの**一方向**でバインドします：

```html title="Upload.html"
<input type="file" accept="image/png, image/jpeg" onchange="(e) => state.files = e.target.files" />
<input type="file" multiple onchange="(e) => state.files = e.target.files" />

<if when="state.files">
  <for each="file of Array.from(state.files)">
    <p>{file.name} ({file.size} bytes)</p>
  </for>
</if>
```

`state.files` は配列ではなく `FileList` です。ループしたり `map` したりするには `Array.from()` で包みます。例：[`/forms/files`](/forms/files)。

## Output、progress、meter {#output-progress-and-meter}

```html title="Meters.html"
<output for="a b" name="total">{total()}</output>

<progress value="{state.uploaded}" max="100"></progress>
<progress></progress>  <!-- no value → endless "loading" animation -->

<meter value="{state.score}" min="0" max="100" low="30" high="70" optimum="100"></meter>
```

- `<output>` は結果を表示します。`for` は、それがどの入力から来ているかをスクリーンリーダーに伝えます。
- `<progress>` は終わりのあるタスク用です。`value` がないと（[`<if>`](/docs/conditionals) で外します）、終わりのないアニメーションを表示します。
- `<meter>` は測定値を表示し、`low` / `high` / `optimum` を使って自分で色を変えます。

例：[`/forms/output-progress-meter`](/forms/output-progress-meter)。

## ループの中の入力欄 {#inputs-inside-a-loop}

インデックスをハンドラに渡して、その項目を変更します：

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

ある行に入力しても他の行には影響しません。入力欄が変わるのは自分の値が変わったときだけで、カーソルもそのままです。例：[`/forms/loop-inputs`](/forms/loop-inputs)。

## バリデーション {#validation}

ブラウザはすでに `required`、`pattern`、`min`、`max`、`minlength`、`type="email"` などをチェックしています。`oninvalid` を使えば、メッセージを独自の方法で表示できます：

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

- フォームの `novalidate="{…}"` は[真偽値属性](/docs/attributes#boolean-attributes)なので、ステートでチェックのオン/オフを切り替えられます。
- ボタンの `formnovalidate` は、そのボタンについてだけチェックを飛ばします。

属性では表現できないルール（「2 つのパスワードが一致する」など）には `setCustomValidity` を使います。**空文字列**は有効を意味します：

```js
const setConfirm = (e) => {
  const field = e.target;
  field.setCustomValidity(field.value === state.pass ? "" : "The two passwords do not match");
  state.confirm = field.value;
};
```

例：[`/forms/validation`](/forms/validation)。

## フォームのイベント {#form-events}

`input` と `change` は**バブリングする**ので、`<form>` にリスナーを 1 つ付けるだけで、すべての入力欄をカバーできます：

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

- `e.submitter` はフォームを送信したボタンです（`<button type="submit" value="publish">`）。
- 複数の入力欄が同じ `name` を持つ場合、`data.getAll(name)` はすべての値を返します。
- `formdata` は `new FormData(form)` が実行されるたびに発火します。
- `<button type="button">` は決して送信しません。フォームの中での他の操作に使います。

例：[`/forms/form-events`](/forms/form-events)。

## ステートを使わないフォーム {#a-form-with-no-state}

大きなフォームでは、すべての入力欄をバインドするのは大変です。各入力欄に `name` を付け、値はブラウザに持たせておき、まとめて読み取りましょう：

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

[`/forms/kitchen-sink`](/forms/kitchen-sink) には、**すべての**種類の入力欄が 1 つのフォームに入っています。コピーして、いらないものを消してください。

## Contenteditable {#contenteditable}

編集可能な `<div>` はフォームの入力欄ではないので、自分でバインドします。プレーンテキストなら `textContent` を、HTML なら `innerHTML` を読みます：

```html title="Editable.html"
<div class="editor" contenteditable="true" oninput="(e) => state.title = e.target.textContent">{state.title}</div>

<div class="editor" contenteditable="true" html="state.note" oninput="(e) => state.note = e.target.innerHTML"></div>
```

ルールは入力欄と同じです：**ユーザーが入力したものはステートに戻す必要があります**。そうしないと、次の更新で消えてしまいます。ステートと内容が一致していれば何も書き換えられないので、カーソルが飛ぶことはありません。

:::warn
`{state.title}` は開始タグと終了タグにぴったりくっつけて、1 行で書いてください。そこに改行があると、テキストの中の本物のスペースになってしまいます。
:::

例：[`/forms/contenteditable`](/forms/contenteditable)。

## コードから入力欄にアクセスする {#reaching-a-field-from-code}

Olum には「ref」はありません。このコンポーネント自身の要素である [`host`](/docs/lifecycle#host) を使います：

```js
const focusNickname = () => host.querySelector("[name=nickname]").focus();

const openPicker = () => host.querySelector("#picker").click();   // a hidden file input
```

キーボード、フォーカス、ドラッグ＆ドロップ、クリップボードについては[イベント](/docs/events)で説明しています。
