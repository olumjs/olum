---
title: Loops
group: Sintaxe de templates
order: 100
source: 0588db1614c1
---

Repita HTML com `<for>`. `each` recebe uma expressão JavaScript (não precisa de `{ }`). Há três formas:

```html title="Component.html"
<!-- array: "item of list" -->
<for each="fruit of state.fruits">
  <li>{fruit.name}</li>
</for>

<!-- count: "i of N" (i goes 1 → N, not from 0) -->
<for each="i of 6">
  <span>Step {i}</span>
</for>

<!-- object keys: "key in obj" -->
<for each="key in state.settings">
  <div>{key}: {state.settings[key]}</div>
</for>
```

## Pegando o índice {#getting-the-index}

Use parênteses para pegar também o **índice** (a partir de 0) e o **array**, como no `Array.map`:

```html title="Component.html"
<for each="(cat, index, arr) of state.cats">
  <li>{index + 1}/{arr.length}: {cat.name}</li>
</for>
```

Os nomes extras são opcionais: `(cat, index)` também funciona.

Para objetos, você recebe `(key, index, value)`, onde `value` é `obj[key]`:

```html title="Component.html"
<for each="(key, index, value) in state.settings">
  <div>{index}. {key} = {value}</div>
</for>
```

Na forma de contagem (`i of 6`), só o primeiro nome é útil, já que `i` já conta de 1 → 6.

## Keys: adicione uma quando os itens podem se mover {#keys-add-one-when-items-can-move}

Adicione `key` para que o Olum saiba qual item é qual quando a lista é reordenada ou quando itens são adicionados ou removidos.

**Sem uma key**, apagar ou mover um item faz o Olum reaproveitar as linhas pela posição e preenchê-las com os dados do vizinho. Tudo o que uma linha "possui" (uma caixa marcada, um vídeo tocando, texto digitado) parece pular para a linha errada. **Com uma key**, as linhas são movidas.

`key` é uma expressão JavaScript (sem `{ }`) que precisa ser única por item:

```html title="Component.html"
<!-- with components: each one keeps its own state -->
<for each="todo of state.todos" key="todo.id">
  <TodoRow todo="{todo}" />
</for>

<!-- with plain elements -->
<for each="todo of state.todos" key="todo.id">
  <li data-done="{todo.done}">{todo.text}</li>
</for>
```

:::note
A key vai só no elemento diretamente dentro do `<for>`, não em filhos mais profundos. Você também pode escrever `key="{item.id}"` (com chaves) em um elemento comum por conta própria; a forma do `<for>` só faz isso por você.
:::

## A contagem precisa ser um número escrito {#the-count-must-be-a-written-number}

`each="i of 6"` só funciona quando o número está escrito ali mesmo. Um número vindo do state não funciona. Monte um array no lugar:

```html title="Component.html"
<!-- ✗ breaks: state.n is a number, not an array -->
<for each="i of state.n">…</for>

<!-- ✓ i goes 1 → n -->
<for each="i of Array.from({ length: state.n }, (_, k) => k + 1)">…</for>
```
