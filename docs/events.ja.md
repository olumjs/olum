---
title: イベント
group: テンプレート構文
order: 110
source: 80c77f0c4147
---

イベントは普通の HTML と同じように動きます。`onclick=""`、`oninput=""` などには**コード**を書きます。

```html title="Component.html"
<!-- call a function (or several) -->
<button onclick="inc()">+</button>
<button onclick="inc(), log()">both</button>

<!-- write an arrow function right there -->
<input oninput="(e) => state.text = e.target.value" />
<button onclick="e => state.n++">no parentheses needed</button>

<!-- $event is the DOM event -->
<input oninput="setValue($event)" />
```

:::note
`mode="prevent"` や `stop` のようなイベント修飾子はありません。コードの中で行ってください：`onsubmit="(e) => { e.preventDefault(); save() }"`。
:::

## 1 つの要素に複数のイベント {#several-events-on-one-element}

`on*` 属性は必要なだけ書けます：

```html title="Component.html"
<input oninput="draft($event)" onblur="save()" onkeydown="hotkey($event)" />

<div onmousedown="startDrag($event)" onmousemove="drag($event)" onmouseup="endDrag()">
  drag me
</div>
```

リスナーは更新をまたいで保持され、ハンドラ（またはループ変数のような、その中の値）が変わったときだけ置き換えられます。[`onMount`](/docs/lifecycle) を使うのは、`window` / `document` のリスナーや、`capture` / `passive` のようなオプションが必要なリスナーの場合だけです。

## ループ変数はそのまま使える {#loop-variables-just-work}

[`<for>`](/docs/loops) の中では、ハンドラでループ変数を直接使えます：

```html title="Component.html"
<for each="flavour of state.menu">
  <button onclick="remove(flavour)">{flavour}</button>
  <button onclick="() => state.pick = flavour">pick</button>
</for>
```

## 自作コンポーネントのイベントは別物 {#events-on-your-components-are-different}

ここまでの内容はすべて**通常の HTML タグ**（`<input>` のような小文字）の話です。**自作のコンポーネント**（`<Input/>` のような PascalCase）では、`on*` 属性は[関数の prop](/docs/components#function-props) であり、`{ }` に入れた関数の**名前**しか受け付けません：

```html title="Component.html"
<input oninput="e => console.log(123)" />    <!-- ✓ HTML tag: code is fine -->
<Input oninput="{handleInput}" />            <!-- ✓ your component: a name -->
<Input oninput="e => console.log(123)" />    <!-- ✗ arrives as a string, never runs -->
<Input oninput="{e => console.log(123)}" />  <!-- ✗ arrives as undefined -->
```

両者を区別するのは先頭の大文字だけです。

## キーボード {#keyboard}

- `keydown` が最初に発火します。`preventDefault()` で文字の入力を止められるのはこれだけです。
- `keyup` は最後に発火します。
- `keypress` は古いイベントで、`Escape` や矢印キーのようなキーは受け取れません。

```html title="TagInput.html"
<script>
  const state = { draft: "", tags: ["olum", "forms"] };

  const handleKeydown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (state.draft.trim()) state.tags.push(state.draft.trim());
      state.draft = "";
    }
    if (e.key === "Escape") state.draft = "";
    if (e.key === "Backspace" && !state.draft) state.tags.pop();   // remove the last tag
    if (e.key === "s" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();                                          // stop the browser's "save page"
      save();
    }
  };
</script>

<input
  value="{state.draft}"
  oninput="(e) => state.draft = e.target.value"
  onkeydown="handleKeydown($event)"
/>
```

便利なイベントのフィールド：`e.key`（文字またはキーの名前）、`e.code`（物理的なキー）、`e.ctrlKey` / `e.shiftKey` / `e.altKey` / `e.metaKey`、そして `e.repeat`（キーが押し続けられている）。例：[`/forms/keyboard-events`](/forms/keyboard-events)。

## フォーカス、ブラー、選択範囲 {#focus-blur-and-selection}

```html title="Profile.html"
<script>
  const state = { nickname: "", focused: "", touched: {}, selection: "" };

  const onFocus = (e) => (state.focused = e.target.name);

  const onBlur = (e) => {
    state.focused = "";
    state.touched[e.target.name] = true;   // e.g. show errors only after the user leaves the field
  };

  const onSelect = (e) => {
    const field = e.target;
    state.selection = field.value.slice(field.selectionStart, field.selectionEnd);
  };

  const focusNickname = () => host.querySelector("[name=nickname]").focus();
</script>

<input
  name="nickname"
  value="{state.nickname}"
  oninput="(e) => state.nickname = e.target.value"
  onfocus="onFocus($event)"
  onblur="onBlur($event)"
  onselect="onSelect($event)"
  autofocus
/>

<button onclick="focusNickname()">Focus the nickname</button>
```

:::warn
`focus` と `blur` は親要素へバブリングしません。ラッパーではなく、入力欄自体に付けてください。
:::

コードから要素にアクセスするには、上のボタンのように `host.querySelector(…)` を使います（[`host`](/docs/lifecycle#host)）。例：[`/forms/focus-and-selection`](/forms/focus-and-selection)。

## ドラッグ＆ドロップ {#drag-and-drop}

`dragover` では `preventDefault()` を**必ず**呼んでください。そうしないとブラウザはドロップを拒否します（代わりにファイルを開いてしまいます）：

```html title="Dropzone.html"
<script>
  const state = { over: false, files: [] };

  const allowDrop = (e) => {
    e.preventDefault();
    state.over = true;
  };

  const onDrop = (e) => {
    e.preventDefault();
    state.over = false;
    state.files = Array.from(e.dataTransfer.files);   // same as a file input's files
  };
</script>

<div
  class="dropzone {state.over ? 'over' : ''}"
  ondragenter="allowDrop($event)"
  ondragover="allowDrop($event)"
  ondragleave="() => state.over = false"
  ondrop="onDrop($event)"
>
  Drop files here
</div>
```

リストを並び替えるには、各行に `draggable="true"` を付け、配列内で項目を移動します。各行が自分の要素を保つように [`key`](/docs/loops#keys-add-one-when-items-can-move) を付けてください：

```html title="Sortable.html"
<for each="(item, index) of state.items" key="item">
  <li
    draggable="true"
    ondragstart="onItemDragStart(index, $event)"
    ondragover="(e) => e.preventDefault()"
    ondrop="onItemDrop(index, $event)"
    ondragend="() => state.dragging = null"
  >
    {item}
  </li>
</for>
```

例：[`/forms/drag-and-drop`](/forms/drag-and-drop)。

## 手動で追加する必要があるイベント {#events-you-must-add-by-hand}

`copy`、`cut`、`paste`、`beforeinput`、`focusin`、`focusout` は `on*` 属性として書くことが**できません**。[`onMount`](/docs/lifecycle) で追加し、クリーンアップで削除してください：

```html title="Note.html"
<script>
  import { onMount } from "olum";

  const state = { text: "Copy me, or paste something here.", pasted: "" };

  onMount(() => {
    const field = host.querySelector("[name=note]");

    const onPaste = (e) => (state.pasted = e.clipboardData.getData("text/plain"));
    const onCopy = () => console.log("copy");

    field.addEventListener("paste", onPaste);
    field.addEventListener("copy", onCopy);

    return () => {
      field.removeEventListener("paste", onPaste);
      field.removeEventListener("copy", onCopy);
    };
  });
</script>

<textarea name="note" value="{state.text}" oninput="(e) => state.text = e.target.value"></textarea>
```

同じパターンは、`window` / `document` のリスナーや、`capture` / `passive` オプションにも使えます。

クリップボードに**書き込む**には `navigator.clipboard.writeText(state.text)` を呼びます。これは promise を返し、ブラウザに拒否されることもあります。例：[`/forms/clipboard-events`](/forms/clipboard-events)。
