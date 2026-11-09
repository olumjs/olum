---
title: Events
group: Template Syntax
order: 110
---

Events work like in plain HTML: `onclick=""`, `oninput=""` and friends hold **code**.

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
There are no event modifiers like `mode="prevent"` or `stop`. Do it in your code: `onsubmit="(e) => { e.preventDefault(); save() }"`.
:::

## Several events on one element

Use as many `on*` attributes as you need:

```html title="Component.html"
<input oninput="draft($event)" onblur="save()" onkeydown="hotkey($event)" />

<div onmousedown="startDrag($event)" onmousemove="drag($event)" onmouseup="endDrag()">
  drag me
</div>
```

Listeners are kept between updates and only replaced when the handler (or a value inside it, like a loop variable) changes. Only use [`onMount`](/docs/lifecycle) for listeners on `window` / `document`, or ones that need options like `capture` / `passive`.

## Loop variables just work

Inside a [`<for>`](/docs/loops), handlers can use the loop variable directly:

```html title="Component.html"
<for each="flavour of state.menu">
  <button onclick="remove(flavour)">{flavour}</button>
  <button onclick="() => state.pick = flavour">pick</button>
</for>
```

## Events on your components are different

Everything above is for **normal HTML tags** (lowercase, like `<input>`). On **your own components** (PascalCase, like `<Input/>`), an `on*` attribute is a [function prop](/docs/components#function-props), and it only accepts a function **name** in `{ }`:

```html title="Component.html"
<input oninput="e => console.log(123)" />    <!-- ✓ HTML tag: code is fine -->
<Input oninput="{handleInput}" />            <!-- ✓ your component: a name -->
<Input oninput="e => console.log(123)" />    <!-- ✗ arrives as a string, never runs -->
<Input oninput="{e => console.log(123)}" />  <!-- ✗ arrives as undefined -->
```

Only the capital letter tells them apart.

## Keyboard

- `keydown` fires first. It's the only one where `preventDefault()` stops the character from being typed.
- `keyup` fires last.
- `keypress` is old: it never sees keys like `Escape` or the arrows.

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

Useful event fields: `e.key` (the character or key name), `e.code` (the physical key), `e.ctrlKey` / `e.shiftKey` / `e.altKey` / `e.metaKey`, and `e.repeat` (the key is held down). Example: [`/forms/keyboard-events`](/forms/keyboard-events).

## Focus, blur and selection

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
`focus` and `blur` don't bubble up to parent elements. Put them on the field itself, not on a wrapper.
:::

To reach an element from code, use `host.querySelector(…)` like the button above ([`host`](/docs/lifecycle#host)). Example: [`/forms/focus-and-selection`](/forms/focus-and-selection).

## Drag and drop

`dragover` **must** call `preventDefault()`, otherwise the browser refuses the drop (and opens the file instead):

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

To reorder a list, add `draggable="true"` to each row and move the item in the array. Add a [`key`](/docs/loops#keys-add-one-when-items-can-move) so each row keeps its own element:

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

Example: [`/forms/drag-and-drop`](/forms/drag-and-drop).

## Events you must add by hand

`copy`, `cut`, `paste`, `beforeinput`, `focusin` and `focusout` **can't** be written as `on*` attributes. Add them in [`onMount`](/docs/lifecycle) and remove them in the cleanup:

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

The same pattern works for `window` / `document` listeners and for `capture` / `passive` options.

To **write** to the clipboard, call `navigator.clipboard.writeText(state.text)`. It returns a promise, and the browser may refuse. Example: [`/forms/clipboard-events`](/forms/clipboard-events).
