---
title: CSS com escopo
group: Componentes
order: 190
source: 57a6aaecd0a7
---

O CSS no `<style>` de um componente afeta **só aquele componente**. Basta escrever CSS normal:

```html title="Component.html"
<style>
  .title { color: #4f46e5; }   /* won't affect other components */
</style>
<h1 class="title">Hello</h1>
```

**Como funciona:** o Olum adiciona um atributo único aos elementos do componente e o acrescenta a cada seletor (`p:hover` vira `p[data-o-x]:hover`). Componentes filhos têm o seu próprio atributo, então nem `.card p` vai estilizar um `<p>` dentro de um componente aninhado.

## Estilos globais {#global-styles}

Seletores que começam com `:root`, `html` ou `body` **não** recebem escopo. Use-os quando um componente precisar de CSS global:

```html title="Component.html"
<style>
  :root { --brand: #25c97e; }        /* a global CSS variable */
  body { overflow: hidden; }          /* global while this style is on the page */
  .panel { color: var(--brand); }     /* scoped as usual */
</style>
```

Para estilos da aplicação toda que não pertencem a um componente, use `public/main.css`.

## Bom saber {#good-to-know}

- **`@keyframes` são por componente.** `@keyframes fade` é renomeado para `fade-<ComponentName>` (e os seus `animation` / `animation-name` são atualizados para combinar), então dois componentes podem ter cada um um `fade` sem conflito.
- **`@media`, `@supports`, `@layer`, `@container`**: as regras de dentro recebem escopo normalmente.
- **`@font-face`** fica como está.
- **Comentários CSS** são removidos.
- Os estilos são adicionados **uma vez por componente** como um `<style id="olum-style-<Name>">` no `<head>`, na primeira vez que ele aparece. Todas as cópias do componente compartilham esse estilo.
- `url(...)` precisa começar com `/` (`url(/assets/x.svg)`), senão quebra em páginas aninhadas. Veja [Arquivos estáticos](/docs/static-assets).
- Não existe seletor `:host` para o `<div>` que envolve o componente. Estilize os seus próprios elementos diretamente.
