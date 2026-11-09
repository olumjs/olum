---
title: Hooks de ciclo de vida
group: Componentes
order: 180
source: 820ee91bfc75
---

`onMount` executa o seu código quando o componente **aparece na página**. Se você retornar uma função, ela roda quando o componente é **removido** (a "limpeza").

```html title="Component.html"
<script>
  import { onMount } from "olum";

  onMount(() => {
    console.log("mounted");
    return () => {
      console.log("removed");
    };
  });
</script>
```

A limpeza roda quando o componente é removido (um `<if>` vira falso, um item de lista com key é apagado, a rota muda) e quando o app inteiro é encerrado com [`app.destroy()`](/docs/embedding) (a incorporação está em manutenção).

:::warn
Chame `onMount` **uma única vez** por componente. Uma segunda chamada é ignorada. Coloque toda a configuração em um único callback e retorne uma única limpeza.
:::

## Carregando dados {#loading-data}

O callback pode ser `async`. É o lugar comum para buscar dados:

```html title="Component.html"
<script>
  import { onMount } from "olum";

  const state = { photos: [] };

  onMount(async () => {
    const res = await fetch("/api/photos");
    state.photos = await res.json();
  });
</script>
```

## Timers e listeners globais {#timers-and-global-listeners}

Inicie timers, loops de `requestAnimationFrame` e listeners de `window` / `document` no `onMount`, e pare-os na limpeza:

```html title="Component.html"
<script>
  import { onMount } from "olum";

  const state = { seconds: 0 };

  onMount(() => {
    const interval = setInterval(() => state.seconds++, 1000);
    return () => clearInterval(interval);
  });
</script>

<p>Open for {state.seconds} {state.seconds === 1 ? "second" : "seconds"}</p>
```

## `host` {#host}

`host` é o próprio elemento que envolve este componente. Não precisa importar. Use `host.querySelector(…)` em vez de `document.querySelector(…)`, que poderia achar um elemento de outra cópia do componente ou de outro lugar da página.

Ele está pronto no `onMount` e nos handlers de eventos (tudo o que roda depois que o componente está na página), mas **não** no nível superior do `<script>`.

```html title="Box.html"
<script>
  import { onMount } from "olum";

  const state = { w: 0, h: 0 };

  onMount(() => {
    const box = host.querySelector(".box");
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      state.w = Math.round(rect.width);
      state.h = Math.round(rect.height);
    });
    observer.observe(box);

    return () => observer.disconnect();
  });
</script>

<p>measured: {state.w}px × {state.h}px</p>
<div class="box">…</div>
```

O mesmo padrão de iniciar/parar funciona para:

- um loop de desenho em `<canvas>`
- um `<video>` que você acompanha com `requestAnimationFrame` (`onplay`, `onpause` e `onloadedmetadata` funcionam como atributos normais; você só precisa do `onMount` para o loop e para coisas como `video.currentTime`)
- eventos que não podem ser escritos como atributos, como `copy` ou `paste` (veja [Eventos](/docs/events#events-you-must-add-by-hand))

Exemplos: [`/forms/host-element`](/forms/host-element) (canvas), [`/forms/dimensions`](/forms/dimensions) (ResizeObserver), [`/forms/media-elements`](/forms/media-elements) (player de vídeo).
