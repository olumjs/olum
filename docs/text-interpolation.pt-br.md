---
title: Interpolação de texto
group: Reatividade
order: 40
source: a6941c575829
---

Mostre um valor JavaScript no seu HTML envolvendo-o em `{ }`. Ele sempre aparece como texto seguro:

```html title="Component.html"
<p>Hello {state.user.name}</p>
<p>Total: {state.items.length} items</p>
<p>{state.count > 0 ? 'positive' : 'zero'}</p>
```

## Bom saber {#good-to-know}

- O valor é **escapado como HTML**, então um texto como `<b>` aparece como texto, não como HTML. Isso protege você contra XSS. Para mostrar HTML de verdade, veja [HTML puro](/docs/raw-html).
- `null` e `undefined` não mostram nada.
- **Não há como escapar `{`** no texto. Qualquer `{…}` é tratado como código. Para mostrar um `{` literal, escreva `{String.fromCharCode(123)}` ou coloque `"{"` em uma `const` e mostre ela.
