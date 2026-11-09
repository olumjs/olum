---
title: Eventos
group: Sintaxe de templates
order: 110
source: 80c77f0c4147
---

Eventos funcionam como em HTML comum: `onclick=""`, `oninput=""` e companhia guardam **código**.

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
Não há modificadores de eventos como `mode="prevent"` ou `stop`. Faça isso no seu código: `onsubmit="(e) => { e.preventDefault(); save() }"`.
:::

## Vários eventos em um elemento {#several-events-on-one-element}

Use quantos atributos `on*` precisar:

```html title="Component.html"
<input oninput="draft($event)" onblur="save()" onkeydown="hotkey($event)" />

<div onmousedown="startDrag($event)" onmousemove="drag($event)" onmouseup="endDrag()">
  drag me
</div>
```

Os listeners são mantidos entre atualizações e só são substituídos quando o handler (ou um valor dentro dele, como uma variável do loop) muda. Use o [`onMount`](/docs/lifecycle) só para listeners em `window` / `document`, ou para os que precisam de opções como `capture` / `passive`.

## Variáveis do loop simplesmente funcionam {#loop-variables-just-work}

Dentro de um [`<for>`](/docs/loops), os handlers podem usar a variável do loop diretamente:

```html title="Component.html"
<for each="flavour of state.menu">
  <button onclick="remove(flavour)">{flavour}</button>
  <button onclick="() => state.pick = flavour">pick</button>
</for>
```

## Eventos nos seus componentes são diferentes {#events-on-your-components-are-different}

Tudo acima vale para **tags HTML normais** (minúsculas, como `<input>`). Nos **seus próprios componentes** (PascalCase, como `<Input/>`), um atributo `on*` é uma [prop de função](/docs/components#function-props), e só aceita o **nome** de uma função em `{ }`:

```html title="Component.html"
<input oninput="e => console.log(123)" />    <!-- ✓ HTML tag: code is fine -->
<Input oninput="{handleInput}" />            <!-- ✓ your component: a name -->
<Input oninput="e => console.log(123)" />    <!-- ✗ arrives as a string, never runs -->
<Input oninput="{e => console.log(123)}" />  <!-- ✗ arrives as undefined -->
```

Só a letra maiúscula os diferencia.

## Teclado {#keyboard}

- `keydown` dispara primeiro. É o único em que `preventDefault()` impede o caractere de ser digitado.
- `keyup` dispara por último.
- `keypress` é antigo: ele nunca vê teclas como `Escape` ou as setas.

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

Campos úteis do evento: `e.key` (o caractere ou o nome da tecla), `e.code` (a tecla física), `e.ctrlKey` / `e.shiftKey` / `e.altKey` / `e.metaKey`, e `e.repeat` (a tecla está sendo segurada). Exemplo: [`/forms/keyboard-events`](/forms/keyboard-events).

## Foco, blur e seleção {#focus-blur-and-selection}

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
`focus` e `blur` não propagam para os elementos pai. Coloque-os no próprio campo, não em um wrapper.
:::

Para alcançar um elemento pelo código, use `host.querySelector(…)` como no botão acima ([`host`](/docs/lifecycle#host)). Exemplo: [`/forms/focus-and-selection`](/forms/focus-and-selection).

## Arrastar e soltar {#drag-and-drop}

`dragover` **precisa** chamar `preventDefault()`, senão o navegador recusa o drop (e abre o arquivo no lugar):

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

Para reordenar uma lista, adicione `draggable="true"` a cada linha e mova o item no array. Adicione uma [`key`](/docs/loops#keys-add-one-when-items-can-move) para que cada linha mantenha o seu próprio elemento:

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

Exemplo: [`/forms/drag-and-drop`](/forms/drag-and-drop).

## Eventos que você precisa adicionar na mão {#events-you-must-add-by-hand}

`copy`, `cut`, `paste`, `beforeinput`, `focusin` e `focusout` **não podem** ser escritos como atributos `on*`. Adicione-os no [`onMount`](/docs/lifecycle) e remova-os na limpeza:

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

O mesmo padrão funciona para listeners de `window` / `document` e para as opções `capture` / `passive`.

Para **escrever** na área de transferência, chame `navigator.clipboard.writeText(state.text)`. Isso retorna uma promise, e o navegador pode recusar. Exemplo: [`/forms/clipboard-events`](/forms/clipboard-events).
