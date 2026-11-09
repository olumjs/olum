---
title: 表单与输入
group: 模板语法
order: 130
source: 1055d001b2a5
---

每个字段都是普通的 HTML。没有包装组件，也没有表单库。处理表单有两种方式，而且可以混用：

1. **把每个字段绑定到 state**，用 `value="{state.x}"` 加上一个写回的事件（[双向绑定](/docs/two-way-binding)）。当页面需要在用户输入时做出反应时使用它。
2. **什么都不绑定。** 给每个字段一个 `name`，然后用 `new FormData(form)` 一次性读取所有值（[见下文](#a-form-with-no-state)）。适合只在提交时才重要的大型表单。

大多数小节都链接到 `/forms/…` 下一个可运行的示例。

## 文本类输入框 {#text-like-inputs}

`text`、`email`、`password`、`tel`、`url` 和 `search` 的绑定方式都一样。一个小的辅助函数能让代码更简短：

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

所有普通的 HTML 属性（`placeholder`、`maxlength`、`autocomplete`、`spellcheck`、`pattern` 等）都照常工作。示例：[`/forms/text-input-types`](/forms/text-input-types)。

## 数字与范围 {#numbers-and-ranges}

`e.target.value` **总是字符串**。用 `+` 把它转成数字：

```html title="Size.html"
<script>
  const state = { w: 4, h: 3 };
</script>

<input type="number" value="{state.w}" oninput="(e) => state.w = +e.target.value" min="0" max="10" />
<input type="range" value="{state.w}" oninput="(e) => state.w = +e.target.value" min="0" max="10" />

<p>area: {state.w} × {state.h} = {state.w * state.h}</p>
```

两个输入框使用同一个键，所以移动一个，另一个也会跟着动。示例：[`/forms/numbers`](/forms/numbers)。

## Textarea {#textarea}

和输入框一样用 `value=""` 绑定。如果它的标签之间也有文本，以 `value` 为准：

```html title="Editor.html"
<script>
  import { marked } from "marked";

  const state = { text: "Olum components are **plain HTML**" };
</script>

<textarea value="{state.text}" oninput="(e) => state.text = e.target.value"></textarea>

<div html="marked(state.text)"></div>
```

`html=""` 会把字符串显示为**真正的 HTML**。只对你信任的内容使用它（[转义与安全](/docs/security)）。示例：[`/forms/textarea`](/forms/textarea)。

## 复选框与单选按钮 {#checkbox-and-radio}

参见[双向绑定](/docs/two-way-binding#checkbox)。对于**一组复选框**，使用 [`<for>`](/docs/loops)。循环变量在处理函数中可用：

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

示例：[`/forms/radio-groups`](/forms/radio-groups)。

## 下拉选择 {#select}

单选：参见[双向绑定](/docs/two-way-binding#select)。记住：`<select>` 上的 `value` 不起作用，要把 `selected` 写在选项上。

对于 `<select multiple>`，请自己收集被选中的选项：

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

`<optgroup>` 是普通的 HTML，所以它也可以来自循环：

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

示例：[`/forms/select`](/forms/select)、[`/forms/multi-select`](/forms/multi-select)。

## Fieldset {#fieldset}

在 `<fieldset>` 上写一个 `disabled`，就会禁用其中的**每一个**字段，而且这些字段不会再随表单提交：

```html title="Shipping.html"
<fieldset disabled="{!state.ship}">
  <legend>Shipping address</legend>
  <input name="street" value="{state.street}" oninput="set('street', $event)" />
  <input name="city" value="{state.city}" oninput="set('city', $event)" />
</fieldset>
```

示例：[`/forms/fieldset-optgroup`](/forms/fieldset-optgroup)。

## Datalist（建议） {#datalist-suggestions}

`<datalist>` 只是**建议**一些值。用户仍然可以输入任何内容：

```html title="Fruit.html"
<input list="fruit-options" name="fruit" value="{state.fruit}" oninput="set('fruit', $event)" />

<datalist id="fruit-options">
  <for each="fruit of state.fruits">
    <option value="{fruit.name}">{fruit.note}</option>
  </for>
</datalist>
```

`type="range"` 也可以吸附到 datalist 上：给它 `list="tick-options"`，并写上 `<option value="25" label="25">` 这样的条目。示例：[`/forms/datalist-autocomplete`](/forms/datalist-autocomplete)。

## 日期与时间 {#date-and-time}

`date`、`time`、`datetime-local`、`month` 和 `week` 的绑定方式和文本一样：

```html title="Dates.html"
<input type="date" name="date" value="{state.date}" oninput="set('date', $event)" min="2026-01-01" max="2026-12-31" />
<input type="time" name="time" value="{state.time}" oninput="set('time', $event)" step="900" />
<input type="datetime-local" name="datetime" value="{state.datetime}" oninput="set('datetime', $event)" />
<input type="month" value="{state.month}" oninput="set('month', $event)" />
<input type="week" value="{state.week}" oninput="set('week', $event)" />
```

:::note
值总是一个**字符串**（`"2026-08-17"`、`"09:30"`、`"2026-W34"`），永远不是 `Date`。要得到 `Date`：`new Date(state.date + "T00:00:00")`。
:::

示例：[`/forms/date-time`](/forms/date-time)。

## 颜色 {#color}

颜色输入框会触发**两个**含义不同的事件：

```html title="Color.html"
<input
  type="color"
  value="{state.color}"
  oninput="(e) => state.color = e.target.value"
  onchange="(e) => state.committed = e.target.value"
/>
```

- `oninput` 在用户在取色器中拖动**的过程中**运行。用它做实时预览。
- `onchange` 在取色器关闭时运行**一次**。用它来保存。

示例：[`/forms/color-input`](/forms/color-input)。

## 文件输入框 {#file-inputs}

只有用户才能设置文件输入框的值，所以要**单向**绑定，从输入框到 state：

```html title="Upload.html"
<input type="file" accept="image/png, image/jpeg" onchange="(e) => state.files = e.target.files" />
<input type="file" multiple onchange="(e) => state.files = e.target.files" />

<if when="state.files">
  <for each="file of Array.from(state.files)">
    <p>{file.name} ({file.size} bytes)</p>
  </for>
</if>
```

`state.files` 是一个 `FileList`，不是数组。用 `Array.from()` 包一下，才能循环或 `map` 它。示例：[`/forms/files`](/forms/files)。

## Output、progress 与 meter {#output-progress-and-meter}

```html title="Meters.html"
<output for="a b" name="total">{total()}</output>

<progress value="{state.uploaded}" max="100"></progress>
<progress></progress>  <!-- no value → endless "loading" animation -->

<meter value="{state.score}" min="0" max="100" low="30" high="70" optimum="100"></meter>
```

- `<output>` 显示一个结果。`for` 告诉屏幕阅读器这个结果来自哪些输入框。
- `<progress>` 用于会完成的任务。没有 `value` 时（用 [`<if>`](/docs/conditionals) 去掉它），它会显示一个不停循环的动画。
- `<meter>` 显示一个测量值，并根据 `low` / `high` / `optimum` 给自己上色。

示例：[`/forms/output-progress-meter`](/forms/output-progress-meter)。

## 循环中的输入框 {#inputs-inside-a-loop}

把索引传给处理函数，然后修改对应的那一项：

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

在一行中输入不会影响其他行：字段只有在它自己的值变化时才会改变，光标也会保持在原位。示例：[`/forms/loop-inputs`](/forms/loop-inputs)。

## 校验 {#validation}

浏览器已经会检查 `required`、`pattern`、`min`、`max`、`minlength`、`type="email"` 等。用 `oninvalid` 以你自己的方式显示提示信息：

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

- 表单上的 `novalidate="{…}"` 是一个[布尔属性](/docs/attributes#boolean-attributes)，所以可以由 state 来开启和关闭校验。
- 按钮上的 `formnovalidate` 只对这个按钮跳过校验。

对于没有任何属性能表达的规则（比如"两次输入的密码一致"），使用 `setCustomValidity`。**空字符串**表示有效：

```js
const setConfirm = (e) => {
  const field = e.target;
  field.setCustomValidity(field.value === state.pass ? "" : "The two passwords do not match");
  state.confirm = field.value;
};
```

示例：[`/forms/validation`](/forms/validation)。

## 表单事件 {#form-events}

`input` 和 `change` **会冒泡**，所以在 `<form>` 上的一个监听器就能覆盖它所有的字段：

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

- `e.submitter` 是提交表单的那个按钮（`<button type="submit" value="publish">`）。
- 当多个字段共用一个 `name` 时，`data.getAll(name)` 会返回所有值。
- 每当 `new FormData(form)` 运行时，都会触发 `formdata`。
- `<button type="button">` 永远不会提交表单。在表单中用它做其他操作。

示例：[`/forms/form-events`](/forms/form-events)。

## 不使用 state 的表单 {#a-form-with-no-state}

对于大型表单，绑定每个字段是很大的工作量。给每个字段一个 `name`，让浏览器保存这些值，然后一次性全部读取：

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

[`/forms/kitchen-sink`](/forms/kitchen-sink) 在一个表单中包含了**所有**字段类型。复制它，再删掉你不需要的部分。

## Contenteditable {#contenteditable}

可编辑的 `<div>` 不是表单字段，所以要自己绑定。纯文本读取 `textContent`，HTML 读取 `innerHTML`：

```html title="Editable.html"
<div class="editor" contenteditable="true" oninput="(e) => state.title = e.target.textContent">{state.title}</div>

<div class="editor" contenteditable="true" html="state.note" oninput="(e) => state.note = e.target.innerHTML"></div>
```

规则和输入框一样：**用户输入的内容必须写回 state**。如果没有写回，下一次更新会把它清掉。当 state 和内容一致时，不会有任何重写，所以光标永远不会跳动。

:::warn
让 `{state.title}` 紧贴开始和结束标签，写在同一行。那里的换行会变成文本中真实的空格。
:::

示例：[`/forms/contenteditable`](/forms/contenteditable)。

## 在代码中访问字段 {#reaching-a-field-from-code}

Olum 没有 "refs"。请使用 [`host`](/docs/lifecycle#host)，也就是这个组件自己的元素：

```js
const focusNickname = () => host.querySelector("[name=nickname]").focus();

const openPicker = () => host.querySelector("#picker").click();   // a hidden file input
```

键盘、焦点、拖放和剪贴板在[事件](/docs/events)中有介绍。
