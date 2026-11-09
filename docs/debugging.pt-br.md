---
title: Depuração
group: Sintaxe de templates
order: 150
source: 68f554f1ee61
---

## `<log>`: imprime um valor quando ele muda {#log-print-a-value-when-it-changes}

Coloque `<log>{expr}</log>` em qualquer lugar do seu template. Ele executa `console.log(expr)` quando o componente aparece pela primeira vez e **toda vez que esse valor muda**. Ele não mostra nada na página. (Como o `{@debug}` do Svelte.)

```html title="Component.html"
<script>
  const state = { user: { firstname: "Ada", lastname: "Lovelace" } };
</script>

<input value="{state.user.firstname}" oninput="(e) => state.user.firstname = e.target.value" />

<log>{state.user}</log>

<h1>Hello {state.user.firstname}!</h1>
```

Abra o console do navegador e digite no campo: `user` é impresso a cada mudança.

- Imprima vários valores separados por vírgulas: `<log>{state.a, state.b}</log>` vira `console.log(state.a, state.b)`.
- Ele só imprime quando muda uma chave de state **que ele lê**. `<log>{state.x}</log>` fica quieto quando `state.y` muda.

Para ter mais controle (parar só sob uma condição), coloque `debugger;` ou `console.log` dentro de um [watcher](/docs/watchers).
