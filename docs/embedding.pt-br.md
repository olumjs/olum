---
title: Incorporando em React e Vue
group: Avançado
order: 260
source: 391c7fa601da
---

Um app Olum pode viver dentro de um app React ou Vue. Monte-o normalmente e chame `app.destroy()` quando o app hospedeiro o remover.

:::warn[Em manutenção]
A incorporação ainda está em desenvolvimento. `app.destroy()` existe, mas esta API e estas regras podem mudar. Não dependa dela em produção ainda.
:::

```js title="main.js"
import Olum from "olum";
import App from "./App.js";

const app = new Olum();
app.$("#olum-app").use(App); // mount
app.destroy();               // unmount and clean up
```

`$()` aceita um seletor CSS **ou um elemento**, então você pode passar uma ref do React ou do Vue diretamente.

## O que o `destroy()` faz {#what-destroy-does}

- Roda a limpeza do [`onMount`](/docs/lifecycle) de cada componente (filhos primeiro).
- Remove o listener do Olum no `window` e descarta qualquer atualização pendente.
- Deixa o `document.head` como estava antes de o Olum mudá-lo (veja [Metadados da página](/docs/metadata)).
- Esvazia o elemento raiz.

Chamar duas vezes é seguro, e chamar antes de `use()` não faz nada. As tags `<style>` dos componentes continuam no `<head>` (cada uma é adicionada só uma vez, então uma montagem posterior ainda tem o seu CSS).

## React {#react}

```jsx title="OlumMount.jsx"
import { useEffect, useRef } from "react";
import Olum from "olum";

export default function OlumMount({ app: App }) {
  const ref = useRef(null);

  useEffect(() => {
    const app = new Olum();
    app.$(ref.current).use(App);
    return () => app.destroy();
  }, [App]);

  return <div ref={ref} />;
}
```

Em desenvolvimento, o StrictMode do React monta, destrói e monta de novo. Tudo bem: cada `new Olum()` começa do zero.

## Vue {#vue}

```html title="OlumMount.vue"
<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";
import Olum from "olum";

const props = defineProps({ app: Function });
const el = ref(null);
let app;

onMounted(() => {
  app = new Olum();
  app.$(el.value).use(props.app);
});
onBeforeUnmount(() => app.destroy());
</script>

<template><div ref="el"></div></template>
```

## Regras {#rules}

:::warn
- **Um app Olum por vez na página.** Destrua o antigo antes de montar um novo (React e Vue já fazem isso na ordem certa quando a rota muda).
- **Não use o router do Olum dentro de um app hospedeiro.** Monte um componente e deixe o router do React/Vue escolher a página. Para trocar de view dentro do Olum, use state e `<if>`.
- **Não dê um `<head>` a um componente incorporado.** Ele brigaria com o gerenciamento de head do app hospedeiro.
- **O app hospedeiro não deve colocar nada dentro do elemento raiz do Olum.** Tudo lá dentro pertence ao Olum.
:::
