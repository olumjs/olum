---
title: Variáveis de ambiente
group: Build e SEO
order: 225
source: 1efeaafd7814
---

Coloque as configurações que mudam entre o seu computador e o site no ar, como o endereço de uma API, em arquivos `.env` e leia-as no seu código como `process.env.NAME`.

```text title=".env.development"
API_URL="http://localhost:3000"
```

```text title=".env.production"
API_URL="https://api.example.com"
```

```html title="src/page.html"
<script>
  import { onMount } from "olum";
  const state = { posts: [] };

  onMount(async () => {
    const res = await fetch(process.env.API_URL + "/posts");
    state.posts = await res.json();
  });
</script>
```

`npm run dev` fala com `http://localhost:3000`, e o site que você gera fala com `https://api.example.com`. Sem mudar o código.

## Qual arquivo é usado {#which-file-is-used}

Os arquivos ficam na raiz do projeto, ao lado do `package.json`:

| Comando | Lê |
|---------|----|
| `npm run dev` | `.env`, depois `.env.development` |
| `npm run build` | `.env`, depois `.env.production` |

- `.env` é opcional e guarda os valores compartilhados pelos dois. Quando um nome está nos dois arquivos, o segundo vence.
- Se você só tem um `.env`, ele é usado no dev **e** no build.
- Nenhum arquivo → `process.env` é um objeto vazio.

## Formato do arquivo {#file-format}

```text title=".env"
# a line starting with # is a comment
API_URL=https://api.example.com
export SITE_NAME="My Shop"    # quotes and `export` are optional
GREETING="Hello\nWorld"       # \n is a new line, inside double quotes only
```

**Todo valor é uma string.** Converta você mesmo:

```js
if (process.env.DEBUG) {}                        // ✗  DEBUG=false is the string "false", which is truthy
if (process.env.DEBUG === "true") {}             // ✓
const pageSize = Number(process.env.PAGE_SIZE);  // ✓  "20" → 20
```

Use nomes feitos de letras, dígitos e `_` (`API_URL`, `apiUrl`).

## Tudo aqui é público {#everything-here-is-public}

:::danger[Nunca coloque segredos nesses arquivos]
Esses valores são **incluídos no build**: são escritos no JS empacotado, e o navegador de cada visitante os baixa, onde qualquer pessoa pode lê-los. Endereços e chaves de funcionalidade tudo bem. **Credenciais críticas** (chaves secretas de API, senhas de banco de dados, tokens privados) devem ficar em um **backend separado**: seu app chama esse backend, e só o backend usa o segredo.
:::

## Como funciona {#how-it-works}

- **No dev**, seus valores vão para um pequeno módulo gerado que define `process.env`. O `main.js` o importa primeiro, então ele roda antes de qualquer código seu. Scripts inline em `public/index.html` rodam antes dele, então não conseguem lê-lo.
- **No build**, cada `process.env.NAME` escrito por extenso é substituído pelo seu valor no JS empacotado. Código atrás de uma verificação que nunca pode passar (`if (process.env.DEBUG === "true")` com `DEBUG=false`) é removido do bundle.
- No build, `process.env[name]` e nomes que não estão no arquivo são `undefined`. Escreva cada nome por extenso.

## Bom saber {#good-to-know}

- **Reinicie o `npm run dev` depois de editar um arquivo `.env`.** O servidor de desenvolvimento os lê ao iniciar.
- `process.env.NODE_ENV` não é um dos seus valores: o build o transforma em `"production"`, e no dev ele é `undefined`, a menos que você o adicione ao `.env.development`.
- Não crie `process` você mesmo em `public/index.html` (`const process = { env: {} }`). Isso esconde os valores que o Olum adiciona, e `process.env` fica vazio no dev.
