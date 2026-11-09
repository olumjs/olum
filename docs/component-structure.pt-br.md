---
title: Estrutura do arquivo de componente
group: Primeiros passos
order: 10
source: 59f27b670f3a
---

Um componente é um arquivo `.html`. Ele pode ter três partes:

- `<script>`: o seu JavaScript (dados e funções)
- `<style>`: o seu CSS (só afeta este componente)
- todo o resto: o template HTML

```html title="Counter.html"
<script>
  const state = { count: 0 };
  const inc = () => state.count++;
</script>

<style>
  .counter { font-weight: 700; }
</style>

<div class="counter">
  Count: {state.count}
  <button onclick="inc()">+</button>
</div>
```

O template pode usar tudo o que foi declarado no `<script>`: `state`, as suas funções e os nomes que você pega de [`props()`](/docs/components).

## Bom saber {#good-to-know}

- **O nome do arquivo é o nome do componente.** `CounterCard.html` vira o componente `CounterCard`. Use PascalCase (cada palavra começa com letra maiúscula).
- **As tags de componente também são PascalCase**: `<CounterCard />`. É por essa letra maiúscula que o Olum diferencia os seus componentes de tags HTML normais como `<div>`.
- **`<script>` e `<style>` são opcionais.** Um arquivo só com HTML é um componente válido.
- **`<style>` tem escopo** automaticamente. Veja [CSS com escopo](/docs/scoped-css).
- **Cada componente é envolvido por um `<div>`** que o Olum adiciona. Esse `<div>` é o elemento [`host`](/docs/lifecycle). Lembre disso ao escrever CSS como `.parent > .child` em volta de um componente.
- **Arquivos de página também podem ter um `<head>`.** Só arquivos de rota (`page.html` e `not-found.html`) podem definir o título da página, a descrição e outras meta tags. Em qualquer outro componente, o `<head>` é ignorado e o build mostra um aviso. Veja [Metadados da página e SEO](/docs/metadata).

```html title="src/blog/[slug]/page.html"
<head>
  <title>{post.title} — My Blog</title>
  <meta name="description" content="{post.excerpt}" />
</head>

<script>
  import { params } from "olum";
  const { slug } = params();
  const post = getPost(slug);
</script>

<article><h1>{post.title}</h1></article>
```
