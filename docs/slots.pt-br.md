---
title: Slots
group: Componentes
order: 170
source: 236ef6cfd7c4
---

Tudo o que você coloca **entre** as tags de um componente chega ao filho como `children`:

```html title="Parent.html"
<CounterCard title="Score">
  <em>passed from the parent</em>
</CounterCard>
```

```html title="CounterCard.html"
<script>
  import { props } from "olum";
  const { children } = props();
</script>

<div class="slot">{children}</div>
```

Como as outras props, `children` está [sempre atualizado](/docs/components#reading-props-in-the-child): se o pai passar outro conteúdo depois, `{children}` mostra o novo. `{props().children}` também funciona.

## Conteúdo padrão {#fallback-content}

`children` fica vazio quando nada foi passado. Use `<if>` / `<else>` para mostrar um conteúdo padrão:

```html title="Box.html"
<script>
  import { props } from "olum";
  const { children } = props();
</script>

<div class="box">
  <if when="children">{children}</if>
  <else><em>no content was provided</em></else>
</div>
```

```html title="Parent.html"
<Box><p>This is a box.</p></Box>   <!-- shows the paragraph -->
<Box />                            <!-- shows the fallback -->
```

:::note
O conteúdo de slot é inserido como **HTML de verdade**, não como texto escapado, porque vem do seu próprio template. Nunca passe texto não confiável por um slot. Veja [Escape e segurança](/docs/security).
:::
