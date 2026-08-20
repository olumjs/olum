---
title: Events
group: Template Syntax
order: 90
---

Native `on*` attributes hold **code** (like real HTML). Two forms:

```html title="Component.html"
<!-- method call(s) -->
<button onclick="inc()">+</button>
<button onclick="inc(), log()">multi</button>

<!-- inline arrow / function (extracted into a method automatically) -->
<input oninput="(e) => state.text = e.target.value" />
<button onclick="e => state.n++">no-paren arrow</button>
```

Pass the DOM event with `$event`:

```html title="Component.html"
<input oninput="setValue($event)" />
```

:::note
Event modifiers (`mode="prevent"`, `stop`, …) are **not** a feature — do it in the handler: `onsubmit="(e)=> { e.preventDefault(); save() }"`.
:::

## Several events on one element

An element can carry as many `on*` attributes as you need — each is wired as its own listener:

```html title="Component.html"
<input oninput="draft($event)" onblur="save()" onkeydown="hotkey($event)" />

<div onmousedown="startDrag($event)" onmousemove="drag($event)" onmouseup="endDrag()">
  drag me
</div>
```

Across re-renders a listener is **kept** as long as its binding is unchanged; it's only swapped when the handler — or a value baked into it, like a loop variable — actually changes. Reach for [`onMount`](/docs/lifecycle) only for listeners that aren't on one of your own elements (`window`, `document`) or that need options like `capture` / `passive`.

## Loop variables just work

A handler written inside a [`<for>`](/docs/loops) can reference the loop variables directly — the per-item value is captured for you, in method calls and inline arrows alike:

```html title="Component.html"
<for each="flavour of state.menu">
  <button onclick="remove(flavour)">{flavour}</button>
  <button onclick="() => state.pick = flavour">pick</button>
</for>
```

:::note
The recognized `on*` names are the standard DOM events (`onclick`, `oninput`, `onchange`, `onkeydown`, …). Everything on this page — inline arrows, bare expressions, `$event` — is for **plain elements**.

On a **component** tag — any PascalCase tag you import, `<Input/>`, `<TextField/>`, `<Comp/>` — the same `on*` name is a [function prop](/docs/components) instead, and a function prop takes a **name only**:

```html title="Component.html"
<input oninput="e => console.log(123)" />    <!-- ✓ the real HTML element: inline code -->
<Input oninput="{handleInput}" />            <!-- ✓ your component: a name -->
<Input oninput="e => console.log(123)" />    <!-- ✗ arrives as a string, never runs -->
<Input oninput="{e => console.log(123)}" />  <!-- ✗ arrives as undefined -->
```

Only the capital letter separates the two.
:::

## Keyboard events

`keydown` fires first, and it is the only one you can `preventDefault()` to stop the character from being typed. `keyup` fires last. `keypress` is legacy — it never sees keys like `Escape` or the arrows.

```html title="TagInput.html"
<script>
  const state = { draft: "", tags: ["olum", "forms"] };

  const addTag = () => {
    const tag = state.draft.trim();
    if (!tag || state.tags.includes(tag)) return;
    state.tags = state.tags.concat(tag);
    state.draft = "";
  };

  const handleKeydown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
    if (e.key === "Escape") state.draft = "";
    if (e.key === "Backspace" && !state.draft && state.tags.length) {
      state.tags = state.tags.slice(0, -1);          // remove the last tag
    }
    if (e.key === "s" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();                            // caught here, not by the browser
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

Useful fields on the event: `e.key` (the character or name), `e.code` (the physical key), `e.ctrlKey` / `e.shiftKey` / `e.altKey` / `e.metaKey`, and `e.repeat` (the key is held down). Example: [`/forms/keyboard-events`](/forms/keyboard-events).

## Focus, blur and selection

```html title="Profile.html"
<script>
  const state = { focused: "", touched: {}, selection: "" };

  const onFocus = (e) => (state.focused = e.target.name);

  const onBlur = (e) => {
    state.focused = "";
    state.touched = { ...state.touched, [e.target.name]: true };   // show errors only after a blur
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
`focus` and `blur` do **not** bubble — put them on the field itself, never on a wrapper. (`focusin` / `focusout` do bubble, but the compiler does not know them — see below.)
:::

There are no element refs in Olum: reach a field with `host.querySelector(…)`, as the button above does ([`host`](/docs/lifecycle)). Example: [`/forms/focus-and-selection`](/forms/focus-and-selection).

## Drag and drop

`dragover` **must** call `preventDefault()`, or the browser refuses the drop and opens the file instead:

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
    state.files = Array.from(e.dataTransfer.files);   // same FileList a file input gives you
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

To reorder a list, put `draggable="true"` on each row and move the item in the array. Add [`key`](/docs/loops) so each row keeps its own DOM while the array is reordered:

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

## Events the compiler does not know

`copy`, `cut`, `paste`, `beforeinput`, `focusin` and `focusout` are **not** in the inline `on*` list. Wire them by hand in [`onMount`](/docs/lifecycle) on the element you get from `host`, and remove them in the returned cleanup:

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

Writing to the clipboard is an API call, not an event — `navigator.clipboard.writeText(state.text)` returns a promise the browser may reject. The same manual pattern covers `window` / `document` listeners and options like `capture` or `passive`. Example: [`/forms/clipboard-events`](/forms/clipboard-events).
