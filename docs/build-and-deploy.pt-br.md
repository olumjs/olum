---
title: Build e deploy
group: Build e SEO
order: 220
source: c290ad764090
---

Faça o build do seu site para produção com um único comando e depois envie a pasta `dist/` para qualquer hospedagem estática:

```bash
npm run build
```

Ele compila os seus componentes, empacota tudo com o **vite** (instalado para você no primeiro build) e escreve o resultado em `dist/`:

```text title="dist/"
dist/
├── index.html                  ← entry page
└── assets/
    ├── index-<hash>.js         ← your app, minified
    ├── index-<hash>.css        ← main.css + all component styles
    ├── favicon-<hash>.svg
    └── ...                     ← every file from public/assets, plus code-split chunks
```

- **Tudo em `public/` é incluído.** Arquivos que o bundler consegue ver ganham nomes com hash; arquivos usados em strings em tempo de execução (como `url(/assets/{type}.svg)`) são copiados como estão. Veja [Arquivos estáticos](/docs/static-assets).
- **Um erro de compilação para o build.** Os erros são mostrados, nada é escrito e o comando falha (para que o CI perceba).

## Pré-visualizar o build {#preview-the-build}

```bash
npm start
```

Isso serve o `dist/` como uma hospedagem real faria, para você conferir antes de fazer o deploy.

## Pré-renderização (recomendada) {#prerendering-recommended}

Adicione um arquivo `src/sitemap.js` e o build também salva cada rota como um arquivo HTML próprio (`dist/about/index.html`, `dist/blog/hello/index.html`, …) além de um `sitemap.xml`. Você ganha páginas que os buscadores conseguem ler, uma primeira pintura mais rápida e deep links que funcionam sem configurar o servidor. Veja [Pré-renderização e SEO](/docs/prerendering).

## Configurações de build {#build-settings}

Todas as configurações de build ficam sob uma chave `olum` no `package.json`. Todas são opcionais:

```json title="package.json"
{
  "olum": {
    "SITE_URL": "https://example.com",
    "SSG_DELAY": 500,
    "base": "/"
  }
}
```

| Configuração | O que faz |
|---------|--------------|
| `SITE_URL` | O seu domínio, usado no `sitemap.xml`. Sem ele, os buscadores ignoram o sitemap. |
| `SSG_DELAY` | Quanto esperar (ms) em cada rota antes de salvá-la na pré-renderização. Padrão `500`. Use `0` se nenhuma página carrega dados no `onMount`. |
| `base` | Onde o site fica. Padrão `/`. Veja [URL base](#base-url). |

As duas primeiras são explicadas em [Pré-renderização e SEO](/docs/prerendering#build-settings).

## Deploy {#deploying}

`dist/` são arquivos estáticos comuns. Envie para qualquer lugar: Netlify, Vercel, Cloudflare Pages, GitHub Pages, nginx, S3…

**Se você pré-renderizou**, não há nada para configurar. `/blog/hello` é uma pasta de verdade com um `index.html`, e toda hospedagem serve isso.

**Se você não pré-renderizou**, precisa de uma configuração:

:::warn
O router usa URLs limpas (**modo history**), então a sua hospedagem precisa enviar `index.html` para todo caminho que não seja um arquivo real. Senão, recarregar uma página como `/blog/hello` mostra um 404. As hospedagens costumam chamar isso de "SPA fallback" ou "rewrite all to /index.html".
:::

```text title="Netlify — public/_redirects"
/*  /index.html  200
```

```json title="Vercel — vercel.json"
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

O router não consegue detectar que falta um rewrite. Ele só muda para URLs com hash (`/#/blog/hello`) quando o navegador não tem a History API.

:::tip
Manter o fallback não faz mal com pré-renderização, e é útil quando só *algumas* rotas são pré-renderizadas: essas carregam o seu próprio arquivo, e o resto cai no shell.
:::

## URL base {#base-url}

Por padrão, todo link em `dist/` começa na raiz do site: `/assets/index-abc123.js`. Isso está certo quando o seu site fica na raiz de um domínio. Se não for o caso, defina `base`:

```json title="package.json"
{
  "olum": { "base": "./" }
}
```

| `base` | Os links viram | Use para |
|--------|--------------|------------|
| ausente ou `"/"` | `/assets/index-abc123.js` | um site na raiz de um domínio (**padrão**) |
| `"./"` | `./assets/index-abc123.js` | um app desktop (nw.js, Electron) que abre `dist/index.html` do disco (`file://`) |
| `"/app/"` | `/app/assets/index-abc123.js` | um site em uma subpasta, ex.: um site de projeto do GitHub Pages |
| `"https://cdn.example.com/"` | `https://cdn.example.com/assets/index-abc123.js` | assets em uma CDN, `index.html` na sua hospedagem |

- As barras são corrigidas para você: `"app"`, `"/app"` e `"/app/"` são a mesma coisa. Qualquer coisa que comece com `.` vira `"./"`.
- Um valor com espaços, aspas ou `<` `>` é rejeitado com um erro, e o build usa `/`.
- `BASE` (em maiúsculas) também funciona.
- Quando a base não é `/`, o build mostra `building with base "./"` primeiro.
- Só o **build** usa isso. `npm run dev` sempre serve a partir de `/`.

### O que é reescrito {#what-gets-rewritten}

O Vite corrige as URLs que consegue ver (tags em `public/index.html`, assets importados). O build também corrige `src`, `href` e `poster` nos seus templates quando eles apontam para um arquivo real em `public/`:

```html
<img src="/assets/logo.svg" />   <!-- with base "./" the bundle says ./assets/logo.svg -->
```

Duas coisas **não** são reescritas:

- **`url(...)` no `<style>` de um componente**, e **caminhos montados em tempo de execução** (`url(/assets/{type}.svg)`). Eles ficam como `/...`, então use um atributo `src` no template para essas imagens.
- **Links do router (`to="/about"`)**: são rotas, não arquivos. Use o `root` do router (abaixo).

:::warn
Não use `"./"` com [pré-renderização](/docs/prerendering). Cada página pré-renderizada fica na sua própria pasta, então `./assets/…` é procurado em `/blog/hello/assets/…` e falha. Use `/` ou uma subpasta como `/app/`.
:::

### Uma subpasta também precisa do router {#a-sub-folder-needs-the-router-too}

`base` move os seus **arquivos**, não as suas **rotas**. Em `/app/` o navegador está em `/app/about`, mas a sua rota é `/about`, então o router gerado automaticamente mostra a página 404. Escreva o seu próprio `src/main.js` e dê ao router o mesmo `root`:

```js title="src/main.js"
import Olum from "olum";
import Router from "olum-router";

import Home from "./page.js";
import About from "./about/page.js";

const routes = [
  { path: "/", comp: Home },
  { path: "/about", comp: About }
];

const router = new Router({ mode: "history", root: "/app", routes: routes });
new Olum().$("#olum-app").use(router);
```

Depois que você cria `src/main.js`, as rotas deixam de ser geradas a partir das suas pastas. Você mantém a lista. Veja [O router](/docs/router/router#opting-out--your-own-mainjs).
