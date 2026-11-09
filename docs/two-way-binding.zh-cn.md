---
title: 双向绑定
group: 模板语法
order: 120
source: efc695f8c242
---

Olum 没有 `model` 属性。要把输入框和 state 连接起来，你需要写两样东西：

1. 一个从 state **读取**的属性（`value`、`checked`、`selected`）
2. 一个**写回** state 的事件（`oninput`、`onchange`）

```html title="Component.html"
<input value="{state.text}" oninput="(e) => state.text = e.target.value" />
```

这就是全部的模式。更多字段类型（日期、颜色、文件、校验、`FormData` 等）见[表单与输入](/docs/forms)。

更新永远不会清掉用户正在输入的内容：只有当模板中的值改变时输入框才会被修改，光标也会保持在原位。参见[渲染与更新](/docs/rendering#inputs-are-never-reset-by-accident)。

## 文本、textarea、数字 {#text-textarea-number}

```html title="Component.html"
<input value="{state.text}" oninput="(e) => state.text = e.target.value" />

<!-- textarea uses value="" too (if it also has text inside, value wins) -->
<textarea value="{state.text}" oninput="(e) => state.text = e.target.value"></textarea>

<!-- e.target.value is always a string: turn it into a number with + -->
<input type="number" value="{state.n}" oninput="(e) => state.n = +e.target.value" />
<input type="range" value="{state.n}" oninput="(e) => state.n = +e.target.value" min="0" max="10" />
```

## 复选框 {#checkbox}

绑定 `checked`，并在 `change` 时读取 `e.target.checked`：

```html title="Component.html"
<input type="checkbox" checked="{state.yes}" onchange="(e) => state.yes = e.target.checked" />

<button disabled="{!state.yes}">Sign up</button>
```

`checked` 和 `disabled` 是[布尔属性](/docs/attributes#boolean-attributes)：值为真时添加，为假时移除。示例：[`/forms/checkboxes`](/forms/checkboxes)。

## 单选按钮 {#radio-buttons}

每个单选按钮检查自己是否与共享的值匹配。给它们相同的 `name`，浏览器就会把它们编为一组：

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

## 下拉选择 {#select}

在正确的 `<option>` 上写 `selected="{…}"`，并在 `onchange` 中读取选择结果：

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
在 `<select>` 本身上写 `value="{…}"` **不起任何作用**。请始终在选项上写 `selected="{…}"`。
:::

多选和文件输入请参见[表单与输入](/docs/forms)。
