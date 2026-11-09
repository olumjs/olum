---
title: Alcance de props y métodos
group: Componentes
order: 210
source: 407ccaae6156
---

Por defecto, todo lo que hay dentro del `<script>` de un componente es **privado**: el resto del código no puede verlo. Puedes hacer **públicas** algunas partes, para que [`scope()`](#reading-a-component-from-outside-scope) pueda leerlas desde fuera.

:::note
En esta página, **"props"** significa los valores `const` de nivel superior de un componente (no los `props()` que pasa un padre), y **"methods"** significa sus funciones.
:::

- **Props**: `const` de nivel superior con un valor simple (un literal, objeto, array, ternario u otro nombre).
- **Methods**: funciones de nivel superior (`function fn() {}` o `const fn = () => …`).
- Cualquier otra cosa (como `const x = compute()`) sigue funcionando dentro del componente, solo que no se puede hacer pública.
- `state` cuenta como una prop.

## Hacer cosas públicas {#making-things-public}

Añade una palabra clave a la etiqueta `<script>`:

```html title="Component.html"
<script public> … </script>            <!-- all props AND methods public -->
<script public-props> … </script>      <!-- only props public -->
<script public-methods> … </script>    <!-- only methods public -->

<script private> … </script>           <!-- everything private (the default) -->
<script private-props> … </script>
<script private-methods> … </script>
```

## Excepciones con `exclude-*` {#exceptions-with-exclude-}

`exclude-<name>` invierte **un** elemento respecto a su grupo:

| Después de… | `exclude-x` hace que `x` sea… |
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
Para mantener `state` privado mientras las demás props son públicas, añade `exclude-state` después de `public-props`.
:::

### El orden importa {#order-matters}

Los atributos se leen **de izquierda a derecha**. Cada palabra clave empieza un grupo, y los `exclude-*` que la siguen pertenecen a ese grupo hasta la siguiente palabra clave:

```text title="reading order"
public-props   exclude-age   exclude-name   private-methods   exclude-get-age
└──────────── props group ───────────────┘  └──────── methods group ───────┘
```

### Escribe los nombres en kebab-case {#write-names-in-kebab-case}

Los nombres de atributos HTML ignoran las mayúsculas, así que escribe los nombres en camelCase con guiones. Olum los convierte de vuelta:

```text title="naming"
getAge    →  exclude-get-age
userName  →  exclude-user-name
isActive  →  exclude-is-active
```

## Leer un componente desde fuera: `scope()` {#reading-a-component-from-outside-scope}

`scope()` encuentra un componente **en la página** por su nombre, desde cualquier sitio (otro componente, la consola, un test):

```js
import { scope } from "olum";

const badge = scope("StatusBadge");
badge.props;    // its PUBLIC props
badge.methods;  // its PUBLIC methods
badge.state;    // its live state (changing it updates that component)
badge.el;       // its root element
badge.key;      // its internal instance key
```

- ¿Hay varios en la página? Indica cuál: `scope("Item", 2)`.
- Si no se encuentra → devuelve `null` y muestra un aviso.

:::tip
`scope()` es una vía de escape. Para datos que varios componentes comparten a propósito, usa el [store global](/docs/store/global-store).
:::
