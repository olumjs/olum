---
title: HTML puro
group: Sintaxe de templates
order: 140
source: 484fb799da47
---

`{expr}` sempre mostra texto, nunca HTML. Quando você realmente precisa inserir HTML, há duas formas. **Use-as apenas com HTML em que você confia** (veja [Escape e segurança](/docs/security)).

## `html="expr"`: preencher um elemento {#htmlexpr-fill-an-element}

O conteúdo do elemento passa a ser esse HTML (os filhos existentes são substituídos):

```html title="Component.html"
<div html="state.articleHtml"></div>
<span html="state.richText"></span>
```

## `olum.html(value)`: inline {#olumhtmlvalue-inline}

Use dentro de `{ }` quando o HTML fica no meio de outro texto:

```html title="Component.html"
<p>Intro: {olum.html(state.snippetHtml)} — end.</p>
```

As duas formas são fáceis de buscar no código, então é fácil revisar onde HTML puro é usado. Todo o resto é escapado.
