---
title: Pré-renderização e SEO
group: Build e SEO
order: 240
source: c22cfc43c2a1
---

Apps Olum rodam no navegador. Isso é ótimo para os usuários, mas um buscador ou uma prévia de link que leia `dist/blog/hello/index.html` só encontraria um shell vazio.

A **pré-renderização** resolve isso. Durante o build, o Olum abre cada página do seu app em um navegador de verdade e salva o HTML pronto como o arquivo próprio daquela página:

```text
npm run build
      ↓
compile + bundle
      ↓
collect every route
      ↓
open YOUR app in a real browser, once per route
      ↓
save the rendered HTML as that route's index.html
      ↓
deploy dist/ to any static host
```

Você ganha uma primeira pintura rápida, deep links que funcionam e páginas que os crawlers conseguem ler. Assim que a página carrega no navegador, ela volta a ser um app Olum normal.

## Ligando {#turn-it-on}

Crie **`src/sitemap.js`**. Esse arquivo é o interruptor: sem ele, o build não pré-renderiza.

```js title="src/sitemap.js"
import { getPosts } from "./api.js";

export default async function () {
  const posts = await getPosts();
  return posts.map((post) => `/blog/${post.slug}`);
}
```

- Ele exporta uma **função** que retorna um **array de URLs**. Ela pode ser `async`.
- É código normal: imports, `fetch`, um cliente de banco de dados, qualquer coisa que o Node consiga rodar.
- Você só lista as **URLs reais das rotas dinâmicas** (como `/blog/hello` para `blog/[slug]`). As rotas normais são encontradas automaticamente a partir dos seus arquivos `page.html`.

:::tip
`src/sitemap.js` não é uma rota e nunca é enviado ao navegador. Ele só roda durante o build.
:::

## Quais páginas são pré-renderizadas {#which-pages-get-prerendered}

As suas rotas normais **mais** o que o `sitemap.js` retornar, sem duplicatas:

```text
from your folders           from sitemap.js
  /                           /blog/hello
  /about                      /blog/world
  /blog                       /match/liverpool
  /blog/:slug        ✗ dropped (a pattern, not a URL)
  /match/:slug       ✗ dropped
        └────────────┬────────────┘
                     ▼
  /  /about  /blog  /blog/hello  /blog/world  /match/liverpool
```

Uma URL do `sitemap.js` que nenhuma rota consegue mostrar é ignorada.

## A saída {#the-output}

Cada rota vira uma **pasta com o seu próprio `index.html`**:

```text title="dist/"
dist/
├── index.html                  ← "/"
├── sitemap.xml
├── about/
│   └── index.html              ← "/about"
├── blog/
│   ├── index.html              ← "/blog"
│   ├── hello/index.html        ← "/blog/hello"
│   └── world/index.html
├── match/
│   └── liverpool/index.html
└── assets/
    └── …
```

Uma pasta pai só ganha um arquivo se ela mesma for uma rota. Se nada define `/match`, não existe `dist/match/index.html`.

Cada arquivo contém a página completa, incluindo [o `<head>` da sua página](/docs/metadata):

```html title="dist/blog/hello/index.html"
<!doctype html>
<html lang="en" data-olum>
  <head>
    <title>Hello — My Blog</title>
    <meta name="description" content="…" />
    …
  </head>
  <body>
    <div id="olum-app"><div data-olum="…"><article><h1>Hello</h1>…</article></div></div>
    <script type="module" src="/assets/index-<hash>.js"></script>
  </body>
</html>
```

O build mostra o que escreveu e o tamanho de cada página:

```text
SSG: 6 route(s) to prerender
 ✓ 1/6  /about
 ✓ 2/6  /blog
 …
SSG: prerendered 6 page(s)
SSG: sitemap.xml lists 6 URL(s)

/
├── about                   1.4 kB
├── blog                    1.1 kB
│   ├── hello               2.3 kB
│   └── world               2.1 kB
└── match
    └── liverpool           1.8 kB
```

## Nenhum rewrite no servidor é necessário {#no-server-rewrite-needed}

Sem pré-renderização, a sua hospedagem precisa responder `/blog/hello` com `/index.html` (veja [Build e deploy](/docs/build-and-deploy#deploying)). Com pré-renderização, `/blog/hello` **é um arquivo de verdade**, então funciona em qualquer hospedagem estática **sem nenhuma configuração**.

:::tip
Mantenha o fallback mesmo assim se algumas rotas **não** forem pré-renderizadas (por exemplo, um `/blog/:slug` que você deixou fora do `sitemap.js`). Rotas pré-renderizadas carregam o seu próprio arquivo; o resto cai no shell.
:::

## Páginas que carregam dados {#pages-that-load-data}

Uma página que busca dados no `onMount` fica **vazia no início**:

```html title="src/match/[slug]/page.html"
<head>
  <title>{slug} vs {state.post?.opponent}</title>
</head>

<script>
  import { params, onMount } from "olum";
  import { getMatch } from "../../api.js";

  const { slug } = params();
  const state = { post: null };

  onMount(async () => {
    state.post = await getMatch(slug);
  });
</script>

<h1>{slug} vs {state.post?.opponent}</h1>
```

O build salva uma página assim que algo aparece na tela, o que acontece **antes** de o `await` terminar. Sem uma espera, você publicaria o estado de carregamento. `SSG_DELAY` (padrão `500` ms) dá a cada página tempo para terminar:

```json title="package.json"
{
  "olum": { "SSG_DELAY": 500 }
}
```

```html title="dist/match/liverpool/index.html"
<title>liverpool vs barcelona</title>
…
<h1>liverpool vs barcelona</h1>
```

O `<head>` atualiza junto com a página, então o arquivo recebe tanto o conteúdo quanto os metadados.

### Escolhendo um valor {#picking-a-value}

Comece com 200–500 ms. O build te diz quanto isso custa:

```text
SSG: waiting 500ms after each route (+46.5s to this build)
```

Depois **confira um arquivo**, porque uma espera curta demais falha em silêncio:

```bash
grep -o "<title[^>]*>[^<]*</title>" dist/match/liverpool/index.html
```

Ainda mostra o estado de carregamento? Aumente. O build está lento demais? Diminua e confira de novo.

:::warn
- **Curta demais:** o build escreve uma página pela metade e ainda mostra ✓. Ninguém percebe até o tráfego de busca cair.
- **Longa demais:** você paga isso em cada rota (500 ms × 93 rotas = 46 s por build).
- É uma espera fixa, não uma verificação. Uma API lenta ou uma máquina de CI ocupada podem não alcançar um valor que funciona no seu notebook. Se puder, mantenha rápidos e locais os dados de que as páginas pré-renderizadas precisam.
:::

## sitemap.xml {#sitemapxml}

Toda rota que foi salva aparece em `dist/sitemap.xml` com a data de hoje como `<lastmod>`. Uma rota que falhou ao renderizar fica de fora (um link quebrado prejudicaria o seu ranking nas buscas).

Os buscadores precisam de URLs completas em um sitemap, então informe o seu domínio ao build com `SITE_URL`. Sem ele, o build avisa e escreve caminhos relativos.

## Configurações de build {#build-settings}

Todas sob a chave `olum` no `package.json`. Nenhuma é obrigatória; o build te diz o que está faltando.

```json title="package.json"
{
  "olum": {
    "SITE_URL": "https://example.com",
    "SSG_DELAY": 500,
    "base": "/"
  }
}
```

### `SITE_URL` {#site_url}

O seu domínio, colocado na frente de cada URL no `sitemap.xml`. Os buscadores ignoram URLs relativas ali, e o build não tem como adivinhar o seu domínio.

| Valor | Resultado |
|--------|--------|
| `"https://example.com"` | `<loc>https://example.com/blog/hello</loc>` |
| ausente | um aviso, e valores `<loc>` relativos que os crawlers ignoram |

A barra no fim é removida para você.

### `SSG_DELAY` {#ssg_delay}

Espera extra, em **milissegundos por rota**, depois que a página aparece e antes de ela ser salva. Útil para páginas que [carregam dados](#pages-that-load-data).

| Valor | Resultado |
|--------|--------|
| ausente | 500 ms (**padrão**) |
| `0` | sem espera |
| `250` | cada rota espera 250 ms |
| não é um número (`true`, `"soon"`, `-1`) | uma mensagem de erro, e depois 500 é usado (o build não falha) |

Use `0` quando todas as páginas já têm os seus dados: a espera é só tempo de build desperdiçado, em cada rota.

### `base` {#base}

Onde o site fica, `/` por padrão. Veja [URL base](/docs/build-and-deploy#base-url).

:::warn
A pré-renderização só funciona com `"/"` ou uma subpasta como `"/app/"`. Uma base relativa (`"./"`) quebra tudo: cada página fica na sua própria pasta, então `./assets/…` é procurado em `/blog/hello/assets/…` e falha.
:::

## No navegador {#in-the-browser}

O HTML pré-renderizado é o que crawlers, prévias de links e a primeira pintura veem. Quando o app inicia, ele renderiza em `#olum-app` como sempre e assume o controle.

:::note
O HTML pré-renderizado é **substituído**, não reaproveitado ("hydrated"). Tudo o que precisa sobreviver no app em execução pertence ao `state`, não ao HTML salvo.
:::

## Pré-visualização {#preview}

```bash
npm start
```

Com `src/sitemap.js`, `/blog/hello` serve `dist/blog/hello/index.html`, então você vê a página pré-renderizada. Sem ele, toda rota serve o `index.html` da raiz, como uma hospedagem real faria.

## O primeiro build é mais lento {#the-first-build-is-slower}

A pré-renderização precisa de um navegador:

- O **vite** é instalado no primeiro build (qualquer build).
- O **puppeteer** é instalado no primeiro build que pré-renderiza, e baixa o Chrome (~150 MB) uma vez.

Sem `sitemap.js`, sem download do puppeteer.

## Bom saber {#good-to-know}

- **Uma página que falha é reportada, mas não é fatal.** O build mostra `✗ /blog/hello — failed to render …` e continua. Essa rota fica com o shell simples e fica de fora do `sitemap.xml`.
- **Uma página conta como pronta** quando o router colocou algo em `#olum-app` (no máximo 15 s). Isso acontece antes de um fetch no `onMount` terminar, daí o `SSG_DELAY`.
- **Só o trabalho feito no carregamento é capturado.** Dados carregados em um clique, um timer mais longo que a espera ou um observador de rolagem não vão estar no arquivo, o que normalmente é o que você quer.
- **`/` é salvo por último** de propósito: o servidor local de pré-visualização usa `dist/index.html` para URLs desconhecidas, então ele precisa continuar sendo um shell vazio até as outras rotas terminarem.
- **Erros de compilação fazem o build inteiro falhar**, então o CI os pega antes do deploy.

## Veja também {#see-also}

- [Metadados da página e SEO](/docs/metadata): o `<head>` que cada página escreve no seu arquivo.
- [Build e deploy](/docs/build-and-deploy): a saída do build e a configuração da hospedagem.
- [Convenções de arquivos](/docs/router/file-conventions): como as pastas viram rotas.
