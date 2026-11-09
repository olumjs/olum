---
title: Renderização e atualizações
group: Reatividade
order: 60
source: afc183e1b614
---

No Olum você nunca chama uma função "render". Você muda o [`state`](/docs/state) ou um [store](/docs/store/global-store), e a página atualiza. Esta página explica o que acontece no meio do caminho.

## O que acontece depois de uma mudança {#what-happens-after-a-change}

1. **A mudança é percebida.** Mudar o `state` (em qualquer profundidade) marca aquele componente para atualizar. Mudar um store marca todos os componentes que usaram aquele store.
2. **As atualizações são agrupadas.** Todos os componentes marcados atualizam **uma vez**, logo depois que o seu código termina. `state.a++; state.b++`, ou um `splice` que move 100 linhas, é uma única atualização.
3. **O novo HTML é montado fora da tela.** Nada mudou na página ainda.
4. **Só as diferenças são aplicadas.** O Olum compara o novo HTML com a página e muda só o que está diferente. Elementos que não mudaram não são tocados.

Se um pai e o seu filho precisam atualizar ao mesmo tempo, só o **pai** atualiza (o que atualiza o filho também).

## O que sobrevive a uma atualização {#what-survives-an-update}

Elementos que não mudaram ficam como estão, então tudo o que o navegador guarda neles permanece:

- o foco, o cursor de texto e a seleção de texto
- a posição de rolagem (inclusive dentro de caixas com rolagem)
- um `<video>` ou `<audio>` tocando, animações e transições CSS rodando
- o conteúdo de `<iframe>` e `<canvas>`
- tudo o que o template não define, como o valor de um input que não está ligado ao state
- os listeners de eventos (um listener só é substituído quando o handler dele, ou um valor usado nele como uma variável do loop, mudou)

:::tip
É por isso que o Olum não tem uma opção de "manter o foco" para aprender. Atualize à vontade.
:::

## Só os componentes que precisam atualizam {#only-components-that-need-it-update}

- **Chaves não usadas são ignoradas.** O Olum sabe quais chaves de `state` cada template lê. Mudar uma chave que o template não usa (uma usada só em handlers ou no `onMount`, por exemplo) não atualiza nada.
- **O uso de stores é automático.** Um componente segue um store só por *lê-lo* no template. Componentes que só escrevem em um store nunca são atualizados por ele.
- **Componentes removidos são ignorados.** Uma atualização pendente de um componente que já não existe (troca de rota, `<if>` fechado) é descartada.

## Keys: qual elemento é qual {#keys-which-element-is-which}

Quando uma lista muda, o Olum combina os elementos antigos e os novos:

- Um componente mantém a sua identidade, então é reaproveitado e mantém o seu state.
- Um elemento comum pode ganhar uma identidade com `key="{item.id}"`, ou com `key` no seu [`<for>`](/docs/loops).
- Elementos com key são **movidos**, não recriados (usando `moveBefore` quando o navegador tem, então até um vídeo tocando sobrevive).
- Elementos sem key são combinados pela posição. Mesmo assim o Olum consegue perceber uma inserção ou remoção simples, então as linhas de baixo não são reconstruídas.

Uma mudança maior sem keys (ordenar, filtrar várias linhas) não dá para combinar assim: as linhas são repintadas com os dados do vizinho em vez de se moverem. Adicione `key` para resolver. Veja [Limitações](/docs/limitations).

## Inputs nunca são resetados por acidente {#inputs-are-never-reset-by-accident}

O Olum só escreve `value` ou `checked` em um input quando o valor **do template** mudou. Assim, uma atualização não relacionada nunca apaga o que está sendo digitado, mas um input ligado ao state continua mudando quando o state muda. Se ele escrever no campo com foco, o cursor fica onde estava. Um `<select>` mantém a escolha do usuário, a menos que o template mova o `selected`. Veja [Binding bidirecional](/docs/two-way-binding).

## Lendo a página logo depois de uma mudança {#reading-the-page-right-after-a-change}

Como as atualizações são agrupadas, na linha seguinte a uma mudança a página ainda está antiga. Aplique as atualizações pendentes na hora com `flushUpdates()`:

```js
import { flushUpdates } from "olum";

state.count++;
flushUpdates();                           // apply pending updates now
host.querySelector("span").textContent;   // up to date
```

É seguro chamar a qualquer momento (não faz nada se não houver nada pendente). É útil principalmente em testes ou quando você precisa medir elementos novos.

:::note
Se alguma atualização falhar, o Olum mostra `patch failed — falling back to full re-render` e reconstrói o componente do zero. A página continua correta, mas o foco, a mídia e a rolagem são resetados. Por favor, reporte esse aviso como um bug.
:::
