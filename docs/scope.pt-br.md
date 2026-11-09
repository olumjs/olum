---
title: Escopo de props e métodos
group: Componentes
order: 210
source: 407ccaae6156
---

Por padrão, tudo dentro do `<script>` de um componente é **privado**: outros códigos não conseguem ver. Você pode tornar partes dele **públicas**, para que [`scope()`](#reading-a-component-from-outside-scope) consiga lê-las de fora.

:::note
Nesta página, **"props"** significa os valores `const` de nível superior de um componente (não os `props()` que um pai passa), e **"methods"** significa as suas funções.
:::

- **Props**: `const`s de nível superior com um valor simples (um literal, objeto, array, ternário ou outro nome).
- **Methods**: funções de nível superior (`function fn() {}` ou `const fn = () => …`).
- Qualquer outra coisa (como `const x = compute()`) continua funcionando dentro do componente, só não pode ser tornada pública.
- `state` conta como uma prop.

## Tornando coisas públicas {#making-things-public}

Adicione uma palavra-chave à tag `<script>`:

```html title="Component.html"
<script public> … </script>            <!-- all props AND methods public -->
<script public-props> … </script>      <!-- only props public -->
<script public-methods> … </script>    <!-- only methods public -->

<script private> … </script>           <!-- everything private (the default) -->
<script private-props> … </script>
<script private-methods> … </script>
```

## Exceções com `exclude-*` {#exceptions-with-exclude-}

`exclude-<name>` inverte **um** item em relação ao seu grupo:

| Depois de… | `exclude-x` deixa `x`… |
|--------|------------------------|
| `public`, `public-props`, `public-methods` | privado |
| `private`, `private-props`, `private-methods` | público |

```html title="Component.html"
<script public-props exclude-age exclude-name private-methods exclude-get-age>
  const age     = 30;
  const name    = "Ann";
  const role    = "admin";

  const getAge  = () => age;
  const getRole = () => role;
</script>

<!--
  props:   public, except age and name  →  role is public
  methods: private, except getAge       →  getAge is public
-->
```

:::tip
Para manter `state` privado enquanto as outras props são públicas, adicione `exclude-state` depois de `public-props`.
:::

### A ordem importa {#order-matters}

Os atributos são lidos **da esquerda para a direita**. Cada palavra-chave começa um grupo, e os `exclude-*` depois dela pertencem a esse grupo até a próxima palavra-chave:

```text title="reading order"
public-props   exclude-age   exclude-name   private-methods   exclude-get-age
└──────────── props group ───────────────┘  └──────── methods group ───────┘
```

### Escreva os nomes em kebab-case {#write-names-in-kebab-case}

Nomes de atributos HTML ignoram maiúsculas, então escreva nomes em camelCase com hífens. O Olum converte de volta:

```text title="naming"
getAge    →  exclude-get-age
userName  →  exclude-user-name
isActive  →  exclude-is-active
```

## Lendo um componente de fora: `scope()` {#reading-a-component-from-outside-scope}

`scope()` encontra um componente **na página** pelo nome, de qualquer lugar (outro componente, o console, um teste):

```js
import { scope } from "olum";

const badge = scope("StatusBadge");
badge.props;    // its PUBLIC props
badge.methods;  // its PUBLIC methods
badge.state;    // its live state (changing it updates that component)
badge.el;       // its root element
badge.key;      // its internal instance key
```

- Vários na página? Diga qual: `scope("Item", 2)`.
- Não encontrado → retorna `null` e mostra um aviso.

:::tip
`scope()` é uma saída de emergência. Para dados que vários componentes compartilham de propósito, use o [store global](/docs/store/global-store).
:::
