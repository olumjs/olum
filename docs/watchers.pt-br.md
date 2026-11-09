---
title: Watchers
group: Reatividade
order: 50
source: e67e52f5534e
---

Um watcher executa o seu código quando uma chave de `state` muda. Declare `const watcher = { ... }` com uma função por chave. Cada função recebe o valor antigo e o novo:

````html title="Component.html"
<script>
  const state = { count: 0, log: "—" };
  const watcher = {
    count(old, next) {
      state.log = `count: ${old} → ${next}`;
    },
  };
</script>
<p>{state.count} — {state.log}</p>
````

Os watchers rodam **na hora**, uma vez por mudança (as atualizações da página são agrupadas; os watchers não).

:::warn
Um watcher só roda quando você **atribui a própria chave**: `state.user = ...`. Uma mudança aninhada como `state.user.name = "Bo"` ou `state.todos.push(t)` atualiza a página, mas **não** roda o watcher. Se você precisa do watcher, atribua um valor novo: `state.user = { ...state.user, name: "Bo" }`.
:::
