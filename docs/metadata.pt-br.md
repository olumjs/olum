---
title: Metadados da página e SEO
group: Build e SEO
order: 230
source: 99b6016ebaac
---

Uma página pode definir o seu próprio `<head>` (título, descrição, cards sociais, link canonical, JSON-LD) direto no seu `page.html`:

```html title="src/blog/[slug]/page.html"
<head>
  <title>{post.title} — My Blog</title>
  <meta name="description" content="{post.excerpt}" />
  <link rel="canonical" href="https://example.com/blog/{slug}" />

  <meta property="og:title" content="{post.title}" />
  <meta property="og:image" content="{post.cover}" />
  <meta name="twitter:card" content="summary_large_image" />
</head>

<script>
  import { params } from "olum";
  import { getPost } from "../../api.js";

  const { slug } = params();
  const post = getPost(slug);
</script>

<article>
  <h1>{post.title}</h1>
  {post.body}
</article>
```

`{expr}` no `<head>` pode usar qualquer coisa do `<script>` (`state`, `params()`, `props()`, as suas constantes), igual ao template.

## Só páginas podem ter um `<head>` {#only-pages-can-have-a-head}

| Arquivo | `<head>` permitido? |
|------|-------------------|
| `page.html` | ✅ sim |
| `not-found.html` | ✅ sim |
| qualquer outro componente | ❌ ignorado, com um aviso no build dizendo para onde movê-lo |

:::warn
- Feche a tag: `<head> … </head>`. Um `<head>` não fechado é ignorado (com um aviso).
- Só o **primeiro** `<head>` de um arquivo é usado.
:::

## Como ele se combina com `public/index.html` {#how-it-combines-with-publicindexhtml}

`public/index.html` é o ponto de partida. As tags da sua página são mescladas nele:

- Se a sua página tem uma tag do **mesmo tipo**, ela **substitui** a original, no mesmo lugar.
- Se não, a sua tag é **adicionada** no fim.
- Todo o resto continua como estava, incluindo as tags `<style>` do Olum e as tags `<script>` / `<link>` do bundler.

O que conta como "do mesmo tipo":

| Tag | Do mesmo tipo quando tem o mesmo… |
|-----|------------------------|
| `<title>`, `<base>` | (só uma por página) |
| `<meta charset>` | `charset` |
| `<meta name>`, `<meta property>`, `<meta http-equiv>`, `<meta itemprop>` | name / property |
| `<link rel="canonical" \| "icon" \| "apple-touch-icon" \| "manifest" \| "amphtml">` | `rel` (só uma por página) |
| `<link rel="stylesheet" \| "preload" \| "preconnect" \| …>` | `rel` **e** `href`, então uma página **adiciona** uma folha de estilos em vez de substituir a sua |
| `<script type="application/ld+json">` | uma por página (dê um `id` a cada uma se precisar de várias) |

**Exemplo.** O shell tem um `<title>`, `charset`, `description`, `viewport` e uma folha de estilos. A página declara um `<title>`, uma `description` e `og:title`. Resultado: o título e a descrição são **substituídos**, `og:title` é **adicionado**, e `charset`, `viewport` e a folha de estilos ficam **intactos**.

`not-found.html` funciona do mesmo jeito, então a sua página 404 pode definir o seu próprio `<title>` e `robots`.

:::tip
Coloque as tags do site inteiro (`charset`, `viewport`, favicon, folha de estilos, `theme-color`) em `public/index.html`. Coloque só as tags específicas de cada página no `<head>` dela.
:::

### Trocar de página é sempre limpo {#changing-pages-is-always-clean}

Toda vez que uma rota carrega, o Olum **primeiro volta o head para o de `public/index.html`** e depois aplica as tags da nova página. Assim, um `og:image` da página anterior nunca vaza para a próxima. Uma página sem `<head>` fica exatamente com o head original.

:::note
As tags substituídas ficam guardadas em um `<template data-olum-head>` oculto (é assim que uma página [pré-renderizada](/docs/prerendering) consegue restaurá-las), e as tags adicionadas por uma página recebem um atributo `data-olum-head`. Os dois são inofensivos; ignore-os.
:::

## Dados estruturados (JSON-LD) {#structured-data-json-ld}

Dentro de `<script type="application/ld+json">`, um `{` comum é JSON normal. `{expr}` só funciona **dentro de uma string entre aspas duplas**, e o valor é inserido **cru** (sem escape de HTML) para que o JSON continue válido:

```html title="src/match/[slug]/page.html"
<head>
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "SportsEvent",
      "name": "{match.name}",
      "url": "https://example.com/match/{slug}",
      "startDate": "{match.kickoff}"
    }
  </script>
</head>
```

:::warn
Como o valor é cru, um `"` ou `\` nele quebra o JSON. Para texto enviado pelo usuário, use `{JSON.stringify(match.name)}` **sem** as aspas em volta.
:::

## Escape em todos os outros lugares {#escaping-everywhere-else}

Fora do JSON-LD, `{expr}` é **escapado como HTML**, como no template, então uma aspa em uma descrição não consegue quebrar a tag.

| Você escreve | Você obtém |
|-----------|---------|
| `` ` `` | uma crase (escapada para você) |
| `\` | uma barra invertida (escapada para você) |
| `${x}` | `$` seguido do valor de `{x}` (o `$` é só texto) |

## Ele atualiza com o seu state {#it-updates-with-your-state}

O head é renderizado de novo junto com a página, em desenvolvimento **e** em produção:

```html title="src/blog/[slug]/page.html"
<head>
  <title>{state.post.title} — My Blog</title>
</head>

<script>
  import { onMount } from "olum";
  const state = { post: { title: "Loading…" } };

  onMount(async () => {
    state.post = await fetchPost();   // the tab title updates
  });
</script>
```

Só a **página** controla o head. Componentes filhos nunca mexem nele, e o head só é reaplicado quando o resultado dele realmente mudou.

:::warn
Prévias de redes sociais (Twitter, Slack, Facebook, LinkedIn) não rodam JavaScript; elas só leem o arquivo HTML. Para elas verem as suas tags, a página precisa ser [pré-renderizada](/docs/prerendering). Se o título vem de um `await`, o build também precisa esperar por ele: é para isso que serve o `SSG_DELAY`.
:::

## Onde ele se aplica {#where-it-applies}

- **`npm run dev`**: aplicado quando uma rota carrega e a cada nova renderização.
- **`npm run build` com pré-renderização**: escrito no `index.html` de cada rota, então os crawlers leem sem JavaScript.
- **`npm run build` sem pré-renderização**: aplicado só no navegador. Ferramentas que não rodam JavaScript veem o head de `public/index.html`.
