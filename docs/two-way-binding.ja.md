---
title: 双方向バインディング
group: テンプレート構文
order: 120
source: efc695f8c242
---

Olum には `model` 属性はありません。入力欄をステートにつなぐには、次の 2 つを書きます：

1. ステートから**読み取る**属性（`value`、`checked`、`selected`）
2. ステートへ**書き戻す**イベント（`oninput`、`onchange`）

```html title="Component.html"
<input value="{state.text}" oninput="(e) => state.text = e.target.value" />
```

パターンはこれだけです。その他の入力の種類（日付、色、ファイル、バリデーション、`FormData` など）は[フォームと入力](/docs/forms)にあります。

更新によってユーザーが入力中の内容が消えることはありません。入力欄が変更されるのはテンプレート上の値が変わったときだけで、カーソルの位置もそのままです。[レンダリングと更新](/docs/rendering#inputs-are-never-reset-by-accident)を参照してください。

## テキスト、textarea、数値 {#text-textarea-number}

```html title="Component.html"
<input value="{state.text}" oninput="(e) => state.text = e.target.value" />

<!-- textarea uses value="" too (if it also has text inside, value wins) -->
<textarea value="{state.text}" oninput="(e) => state.text = e.target.value"></textarea>

<!-- e.target.value is always a string: turn it into a number with + -->
<input type="number" value="{state.n}" oninput="(e) => state.n = +e.target.value" />
<input type="range" value="{state.n}" oninput="(e) => state.n = +e.target.value" min="0" max="10" />
```

## チェックボックス {#checkbox}

`checked` をバインドし、`change` で `e.target.checked` を読み取ります：

```html title="Component.html"
<input type="checkbox" checked="{state.yes}" onchange="(e) => state.yes = e.target.checked" />

<button disabled="{!state.yes}">Sign up</button>
```

`checked` と `disabled` は[真偽値属性](/docs/attributes#boolean-attributes)です。値が truthy なら追加され、falsy なら削除されます。例：[`/forms/checkboxes`](/forms/checkboxes)。

## ラジオボタン {#radio-buttons}

各ラジオボタンは、共有の値と一致するかどうかをチェックします。ブラウザがグループとして扱えるよう、同じ `name` を付けてください：

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

## セレクト {#select}

該当する `<option>` に `selected="{…}"` を付け、`onchange` で選択を読み取ります：

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
`<select>` 自体に付けた `value="{…}"` は**何もしません**。必ず option に `selected="{…}"` を付けてください。
:::

複数選択やファイル入力については[フォームと入力](/docs/forms)を参照してください。
