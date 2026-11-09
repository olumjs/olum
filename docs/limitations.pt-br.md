---
title: Limitações
group: Avançado
order: 270
source: 63fd71405920
---

O Olum é pequeno de propósito, então algumas coisas faltam. Cada uma tem uma solução simples.

## 1. Listas sem `key` combinam linhas pela posição {#1-lists-without-key-match-rows-by-position}

Se uma lista `<for>` sem key é reordenada, as linhas são repintadas com os dados do vizinho, então coisas como uma caixa marcada parecem pular para a linha errada. Adicione [`key`](/docs/loops#keys-add-one-when-items-can-move) e as linhas passam a ser movidas. Veja [Renderização e atualizações](/docs/rendering#keys-which-element-is-which).

## 2. Sem refs de elementos nem actions {#2-no-element-refs-or-actions}

Não há `bind:this` nem `use:action`. Faça você mesmo no [`onMount`](/docs/lifecycle), use `host` para achar o elemento e retorne uma limpeza:

```html title="Component.html"
<script>
  import { onMount } from "olum";
  import { longpress } from "./longpress.js";

  onMount(() => {
    const button = host.querySelector("button");   // the "ref"
    const action = longpress(button, 2000);        // the "action"
    return () => action.destroy();                 // cleanup when removed
  });
</script>

<button>press and hold</button>
```

`onMount` roda uma vez, não a cada atualização. Tudo bem: as atualizações [mudam os elementos no lugar](/docs/rendering), então o botão continua sendo o mesmo elemento e continua funcionando. Se o comportamento depender do state, leia o state dentro dos handlers.

(Animações **são** embutidas. Veja [Transições](/docs/transition/transitions).)

## 3. Sem elementos `<window>` / `<document>` / `<body>` {#3-no-window--document--body-elements}

Para ouvir eventos globais, adicione o listener no `onMount` e remova-o na limpeza:

```html title="Component.html"
<script>
  import { onMount } from "olum";

  const state = { keys: [] };
  const handleKeydown = (e) => (state.keys = [...state.keys, e.key].slice(-8));

  onMount(() => {
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  });
</script>
```

O mesmo vale para eventos de `document` como `selectionchange`.

## 4. Sem tag de componente dinâmico {#4-no-dynamic-component-tag}

Não existe `<component is="…">`. Use `<if>` / `<else-if>` com um valor no state:

```html title="Component.html"
<script>
  import RedThing from "./RedThing";
  import GreenThing from "./GreenThing";
  import BlueThing from "./BlueThing";

  const state = { color: "red" };
</script>

<if when="state.color === 'red'"><RedThing /></if>
<else-if when="state.color === 'green'"><GreenThing /></else-if>
<else><BlueThing /></else>
```

## 5. Props de função precisam ser um nome {#5-function-props-must-be-a-name}

Nos seus próprios componentes, uma prop de função só funciona quando é um simples **nome** (uma função no `<script>` do pai, ou uma vinda de `props()`). Uma arrow inline, `obj.fn` ou uma chamada não chegam como função:

```html title="Parent.html"
<!-- <Input/> = YOUR component, not the HTML <input/> -->
<Input oninput="{handleInput}" />              <!-- ✓ -->
<Input oninput="(e) => state.text = e" />      <!-- ✗ arrives as text -->
<Input oninput="{(e) => state.text = e}" />    <!-- ✗ arrives as undefined -->
```

Tags HTML normais não são afetadas: nelas, código inline em `on*` funciona ([Eventos](/docs/events)). Para passar dados extras, envie-os como uma prop própria e deixe o filho devolvê-los ([Componentes e props](/docs/components#function-props)).
