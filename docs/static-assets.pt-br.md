---
title: Arquivos estáticos
group: Primeiros passos
order: 20
source: 2c152bc5a54e
---

Coloque imagens, ícones, fontes e downloads na pasta `public/`. Tudo o que está nela é servido a partir da **raiz do site**: `public/assets/logo.svg` fica disponível em `/assets/logo.svg`.

## Sempre comece a URL com `/` {#always-start-the-url-with}

```html title="Component.html"
<!-- ✓ works on every page, in dev and in production -->
<img src="/assets/logo.svg" />

<style>
  .icon { background: url(/assets/folder.svg) no-repeat; }
</style>

<!-- ✗ breaks in production -->
<img src="assets/logo.svg" />
```

**Por quê:** o Olum adiciona os seus templates e estilos à página enquanto ela roda, então o navegador resolve uma URL relativa a partir da página atual. Em `/shop/cart`, `assets/logo.svg` vira `/shop/assets/logo.svg`, que não existe.

:::warn
O servidor de desenvolvimento esconde esse erro: ele tenta caminhos mais curtos até achar o arquivo, então uma URL relativa *parece* funcionar enquanto você desenvolve. Hospedagens reais não fazem isso. Sempre escreva `/assets/...`.
:::

## Caminhos dinâmicos {#dynamic-paths}

Uma URL é só uma string, então você pode usar `{expr}` dentro dela. Mantenha a `/` inicial:

```html title="File.html"
<span style="background-image: url(/assets/{type}.svg)">{name}</span>
```

O [build](/docs/build-and-deploy) copia todos os arquivos de `public/` para a saída, então arquivos usados assim sempre estão lá.

## O site não está na raiz do domínio? {#site-not-at-the-domain-root}

Continue escrevendo `/assets/...`. Se você definir uma [`base`](/docs/build-and-deploy#base-url) diferente de `/` (uma subpasta, uma CDN, um app desktop com `file://`), o build corrige para você os valores de `src`, `href` e `poster` que apontam para um arquivo real em `public/`.

:::warn
Duas coisas **não** são corrigidas e ficam como `/...`: `url(...)` dentro do `<style>` de um componente, e caminhos montados em tempo de execução como `url(/assets/{type}.svg)`. Com uma base personalizada, eles não vão achar o arquivo. Para essas imagens, use um atributo `src` no template.
:::

:::note
`public/index.html` (o shell do seu app) e `public/main.css` (o seu CSS global) são processados pelo build. Todo o resto em `public/` é publicado como está, então não deixe arquivos de rascunho lá.
:::
