---
title: Condicionais
group: Sintaxe de templates
order: 80
source: 4117f1ba9e5d
---

Mostre HTML diferente conforme uma condição. `when` recebe uma expressão JavaScript (não precisa de `{ }`):

```html title="Component.html"
<if when="state.tab === 'a'">
  <p>Tab A</p>
</if>
<else-if when="state.tab === 'b'">
  <p>Tab B</p>
</else-if>
<else>
  <p>Fallback</p>
</else>
```

Qualquer condição JavaScript funciona:

```html title="Component.html"
<if when="state.count >= 5 && state.count < 10">in range</if>
```

Quando a condição é falsa, o conteúdo é **removido** da página. Para apenas escondê-lo, use [`<show>`](/docs/show).
