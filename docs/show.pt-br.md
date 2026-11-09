---
title: Mostrar / esconder
group: Sintaxe de templates
order: 90
source: b55bd0de179f
---

Como o `<if>`, mas o conteúdo **continua na página** e só fica escondido:

```html title="Component.html"
<show when="state.visible">
  <div class="panel">Always on the page; only hidden or shown.</div>
</show>
```

Como nada é removido, um `<video>` tocando, uma animação rodando ou o texto digitado em um input sobrevivem a ser escondidos e mostrados de novo.

**Como funciona:** `<show>` vira um wrapper `<div data-o-show>`. Quando visível, ele tem `display: contents` (não ocupa espaço, então os filhos aparecem como se ele não existisse). Quando escondido, ele tem `display: none`.

:::note
- O wrapper está sempre lá, então uma regra CSS como `.parent > .panel` não vai bater. Use `[data-o-show] > .panel` ou tire o `>`.
- Um `<div>` não é permitido dentro de `<table>` ou `<select>`, então não use `<show>` em volta de linhas de tabela ou de options. Nesses casos, use [`<if>`](/docs/conditionals) ou um atributo `style`.
:::
