---
title: Atributos
group: Sintaxe de templates
order: 70
source: 85c49fc9c132
---

## Atributos normais: texto com `{ }` dentro {#normal-attributes-text-with---inside}

Escreva atributos como em HTML comum. Adicione `{expr}` **dentro das aspas** nas partes que mudam:

```html title="Component.html"
<div class="card {state.active ? 'is-active' : ''}"></div>
<a href="/users/{state.user.id}" title="Open {state.user.name}">Profile</a>
<img src="/avatars/{state.user.id}.png" alt="avatar" />
<input id="field-{state.index}" type="text" />

<!-- inline style is just text too (use CSS names like background-color) -->
<div style="color:{state.color}; background:{state.bg}; padding:8px;">box</div>
```

## Atributos de código: sem `{ }` {#code-attributes-no---needed}

Alguns atributos guardam JavaScript diretamente: `when`, `each`, `key`, `on*` (eventos) e `html`. Cada um tem a sua própria página.

```html title="Component.html"
<if when="state.count > 0"> … </if>
<button onclick="inc()">+</button>
```

:::tip[A única regra para lembrar]
O atributo é **código** ou **texto**? O próprio HTML já te diz: `onclick=""` é código, `class=""` é texto. Atributos de código (`when`, `each`, `key`, `on*`, `html`) recebem JavaScript diretamente. Todo o resto é texto, com `{ }` nas partes que mudam.
:::

## Atributos booleanos {#boolean-attributes}

Em atributos como `disabled` ou `checked`, o navegador só verifica se o atributo **existe**: `checked="false"` continua marcado! Por isso, quando o valor inteiro é um único `{expr}`, o Olum **adiciona** o atributo quando ele é verdadeiro e o **remove** quando é falso:

```html title="Component.html"
<button disabled="{state.busy}">Save</button>
<input type="checkbox" checked="{state.on}" />
<details open="{state.expanded}">…</details>
```

Funciona para: `checked`, `disabled`, `selected`, `readonly`, `required`, `hidden`, `autofocus`, `multiple`, `open`, `loop`, `muted`, `controls`, `autoplay`, `novalidate`, `default`, `defer`, `ismap`, `reversed`.

:::note
O valor precisa ser **exatamente um** `{expr}`. Algo como `checked="a {b}"` não faz sentido em um atributo booleano.
:::

## URLs de arquivos começam com `/` {#file-urls-start-with}

`src`, `href` e `url()` do CSS que apontam para arquivos em `public/` precisam começar com `/`: escreva `/assets/logo.svg`, nunca `assets/logo.svg`. Senão eles quebram em produção. Veja [Arquivos estáticos](/docs/static-assets).
