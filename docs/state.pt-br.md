---
title: Estado e reatividade
group: Reatividade
order: 30
source: 28d31ae11591
---

Coloque os dados que o seu componente mostra em `const state = { ... }`. **Quando você muda o `state`, a página se atualiza sozinha.**

```html title="Component.html"
<script>
  const state = { count: 0, user: { name: "Ann" } };

  const inc = () => state.count++;                 // page updates
  const rename = () => (state.user.name = "Bo");   // nested changes update it too
</script>

<p>{state.count} — {state.user.name}</p>
<button onclick="inc()">+</button>
```

:::warn
Só o `state` é reativo. Mudar uma variável `const` ou `let` comum **não** atualiza a página.
:::

## Escreva o `state` como um objeto literal {#write-state-as-a-literal-object}

Ele precisa ser um `const state = { ... }` de nível superior, com o objeto escrito ali mesmo. `const state = makeState()` não é detectado, então nada vai atualizar.

## Mudanças em qualquer profundidade funcionam {#changes-at-any-depth-work}

Objetos aninhados, arrays, `Map` e `Set` são todos rastreados:

```js
state.user.name = "Bo";          // ✓ nested object
state.user.prefs.theme = "dark"; // ✓ any depth
state.todos.push(todo);          // ✓ array methods (push, splice, sort, …)
state.todos[0].done = true;      // ✓ array item
state.tags.add("new");           // ✓ Map / Set
```

Outros tipos de objetos (`Date`, elementos do DOM, instâncias de classes) **não** são rastreados. Depois de mudar um deles, atribua um valor **novo** à chave dele: `state.date = new Date(state.date)`.

:::warn
Atribuir o **mesmo** objeto de volta (`state.todos = state.todos`) não faz nada, porque nada mudou. Para forçar uma atualização, atribua um array ou objeto novo (`[...state.todos]`, `map`, `filter`, `slice`, `{ ...obj }`).
:::

## Valores derivados são só funções {#derived-values-are-just-functions}

Precisa de um valor calculado a partir do state? Escreva uma função e chame-a no template. Ela roda de novo a cada atualização, então está sempre em dia. Funções podem chamar umas às outras:

```html title="Component.html"
<script>
  const state = { count: 1 };

  const doubled = () => state.count * 2;
  const quadrupled = () => doubled() * 2;
</script>

<p>{state.count} * 2 = {doubled()}</p>
<p>{doubled()} * 2 = {quadrupled()}</p>
```

## As atualizações são agrupadas {#updates-are-grouped}

Várias mudanças seguidas (`state.a++; state.b++`, ou um único `splice` em um array grande) causam **uma** atualização, não várias. E a atualização só [muda o que está diferente](/docs/rendering) na página. Então mude o `state` do jeito que for mais legível; não há motivo de desempenho para evitar `push` ou `splice`.

O detalhe: a página é atualizada um instante **depois** da sua mudança, não na mesma linha. Se você precisar ler a página atualizada na hora (principalmente em testes), chame `flushUpdates()`:

```js
import { flushUpdates } from "olum";

state.count++;
flushUpdates();                         // apply pending updates now
host.querySelector("span").textContent; // up to date
```

:::note
`window.olum.flushUpdates()` faz a mesma coisa, mas só em desenvolvimento. Em produção, `window.olum` só tem `version` e `framework` (para ferramentas de detecção), então importe `flushUpdates`.
:::

Os [watchers](/docs/watchers) são diferentes: eles rodam na hora, uma vez por mudança.

Mudar uma chave do state que o template nunca usa não atualiza a página de jeito nenhum. Veja [Renderização e atualizações](/docs/rendering).
