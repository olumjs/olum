---
title: 事件
group: 模板语法
order: 110
source: 80c77f0c4147
---

事件的用法和普通 HTML 一样：`onclick=""`、`oninput=""` 等属性中放的是**代码**。

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
没有 `mode="prevent"` 或 `stop` 这样的事件修饰符。请在代码中处理：`onsubmit="(e) => { e.preventDefault(); save() }"`。
:::

## 一个元素上的多个事件 {#several-events-on-one-element}

需要多少个 `on*` 属性就写多少个：

```html title="Component.html"
<input oninput="draft($event)" onblur="save()" onkeydown="hotkey($event)" />

<div onmousedown="startDrag($event)" onmousemove="drag($event)" onmouseup="endDrag()">
  drag me
</div>
```

监听器会在多次更新之间保留，只有当处理函数（或其中的某个值，比如循环变量）发生变化时才会被替换。只有 `window` / `document` 上的监听器，或者需要 `capture` / `passive` 等选项的监听器，才需要用 [`onMount`](/docs/lifecycle)。

## 循环变量直接可用 {#loop-variables-just-work}

在 [`<for>`](/docs/loops) 内部，处理函数可以直接使用循环变量：

```html title="Component.html"
<for each="flavour of state.menu">
  <button onclick="remove(flavour)">{flavour}</button>
  <button onclick="() => state.pick = flavour">pick</button>
</for>
```

## 你自己组件上的事件有所不同 {#events-on-your-components-are-different}

上面的一切都适用于**普通 HTML 标签**（小写，比如 `<input>`）。在**你自己的组件**上（PascalCase，比如 `<Input/>`），`on*` 属性是一个[函数 prop](/docs/components#function-props)，它只接受写在 `{ }` 中的函数**名称**：

```html title="Component.html"
<input oninput="e => console.log(123)" />    <!-- ✓ HTML tag: code is fine -->
<Input oninput="{handleInput}" />            <!-- ✓ your component: a name -->
<Input oninput="e => console.log(123)" />    <!-- ✗ arrives as a string, never runs -->
<Input oninput="{e => console.log(123)}" />  <!-- ✗ arrives as undefined -->
```

只有首字母的大小写能区分它们。

## 键盘 {#keyboard}

- `keydown` 最先触发。只有在它里面调用 `preventDefault()` 才能阻止字符被输入。
- `keyup` 最后触发。
- `keypress` 已经过时：它永远捕获不到 `Escape` 或方向键这样的按键。

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

有用的事件字段：`e.key`（字符或按键名称）、`e.code`（物理按键）、`e.ctrlKey` / `e.shiftKey` / `e.altKey` / `e.metaKey`，以及 `e.repeat`（按键被按住）。示例：[`/forms/keyboard-events`](/forms/keyboard-events)。

## 聚焦、失焦与选区 {#focus-blur-and-selection}

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
`focus` 和 `blur` 不会冒泡到父元素。请把它们写在字段本身上，而不是包裹元素上。
:::

要在代码中访问某个元素，像上面的按钮那样使用 `host.querySelector(…)`（[`host`](/docs/lifecycle#host)）。示例：[`/forms/focus-and-selection`](/forms/focus-and-selection)。

## 拖放 {#drag-and-drop}

`dragover` **必须**调用 `preventDefault()`，否则浏览器会拒绝放置（并改为打开文件）：

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

要对列表重新排序，给每一行加上 `draggable="true"`，并在数组中移动该项。加上 [`key`](/docs/loops#keys-add-one-when-items-can-move)，让每一行保留自己的元素：

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

示例：[`/forms/drag-and-drop`](/forms/drag-and-drop)。

## 必须手动添加的事件 {#events-you-must-add-by-hand}

`copy`、`cut`、`paste`、`beforeinput`、`focusin` 和 `focusout` **不能**写成 `on*` 属性。请在 [`onMount`](/docs/lifecycle) 中添加它们，并在清理函数中移除：

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

同样的模式也适用于 `window` / `document` 上的监听器，以及 `capture` / `passive` 选项。

要**写入**剪贴板，请调用 `navigator.clipboard.writeText(state.text)`。它返回一个 promise，浏览器也可能拒绝。示例：[`/forms/clipboard-events`](/forms/clipboard-events)。
