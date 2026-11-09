---
title: Escape e segurança
group: Avançado
order: 250
source: d8626fdc23d9
---

O Olum protege você contra XSS (scripts injetados) por padrão: todo valor é escapado, a menos que você desative isso de propósito.

- **Por padrão**, todo `{expr}` no texto e nos atributos é escapado como HTML (com `olum.esc`). Assim, um `<script>` nos dados do usuário aparece como texto e não pode rodar, e caracteres como `<` ou `"` não conseguem quebrar a sua página.
- **Para inserir HTML de verdade** (apenas conteúdo confiável), use `html="expr"` em um elemento ou `olum.html(value)` inline. Veja [HTML puro](/docs/raw-html).
- **O conteúdo de slots** (`children`) é inserido como HTML, porque vem do seu próprio template. Veja [Slots](/docs/slots).

:::danger{icon="🔒"}
Nunca passe conteúdo do usuário para `html=` ou `olum.html()`. Se precisar mostrar HTML enviado pelo usuário, sanitize-o antes.
:::
