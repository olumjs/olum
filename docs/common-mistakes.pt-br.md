---
title: Erros comuns
group: Avançado
order: 280
source: 81301d5481bf
---

O Olum tem **um único jeito** de fazer cada coisa, e os valores sempre vão **dentro de aspas**. Aqui está o que quem vem de outros frameworks costuma escrever por engano.

## Sintaxe de templates {#template-syntax}

| ✗ Não escreva | ✓ Escreva assim | Por quê |
|---------------|-----------------|-----|
| `when={x}` / `each={x}` | `when="x"` / `each="x"` | valores vão em `""` |
| `value={state.x}` | `value="{state.x}"` | atributo de texto + `{}` |
| `:title="x"` | `title="{x}"` | não há bindings com `:` |
| `:style="{…}"` | `style="color:{x}; …"` | style é texto + `{}` |
| `<img {src} />` | `<img src="{src}" />` | não há forma abreviada |
| `oninput={(e)=>…}` | `oninput="(e)=>…"` | eventos vão em `""` |
| `mode="prevent"` | `e.preventDefault()` no handler | não há modificadores de eventos |
| `model="state.x"` | `value="{state.x}"` + `oninput` | [faça o binding na mão](/docs/two-way-binding) |
| um `{` literal no texto | `{String.fromCharCode(123)}` | qualquer `{…}` é código |
| `each="i of state.n"` | `each="i of Array.from({length: state.n}, (_, k) => k + 1)"` | a contagem precisa ser um número escrito |
| `url(assets/x.svg)` / `src="assets/…"` | `url(/assets/x.svg)` | URLs de arquivos [começam com `/`](/docs/static-assets) |
| `oninput="…" onblur="…"` em um elemento | está certo assim | vários `on*` por elemento funcionam |

## Componentes e props {#components-and-props}

| ✗ Não escreva | ✓ Escreva assim | Por quê |
|---------------|-----------------|-----|
| `<comp/>` | `<Comp/>` | componentes são PascalCase |
| `<Comp {a} />` / `<Comp a={a} />` | `<Comp a="{a}" />` | sem forma abreviada, valores em `""` |
| `<Comp {...obj} />` | `<Comp a="{obj.a}" b="{obj.b}" />` | sem spread, passe cada campo |
| `<Comp onX="(e)=>…" />` | `<Comp onX="{handler}" />` | em um componente, `on*` é uma prop; a arrow chega como texto |
| `<Comp onX="{(e)=>…}" />` / `<Comp onX="{obj.fn}" />` | dê um nome à função e passe o nome | [props de função](/docs/components#function-props) precisam ser um nome, senão chegam como `undefined` |
| `const { color } = props(); color = "x"` | `const { onChange } = props(); onChange("x")` | props são somente leitura (atribuir lança erro) |
| `const { a, ...rest } = props()` | use `props()` para o resto | `rest` [nunca é atualizado](/docs/components#what-is-only-read-once) |
| `const { user: { name } } = props()` | `const { user } = props()`, depois `user.name` | padrões aninhados não são atualizados |
| `const { [key]: v } = props()` | `props()[key]` | chaves computadas não são atualizadas |
| `const p = props(); const { a } = p` | `const { a } = props()` | desestruture `props()` diretamente |
| `onMount(() => { const { a } = props(); … })` | desestruture no topo do `<script>` | dentro de uma função é lido uma vez só |
| `const { a, b = a } = props()` | dê a `b` o seu próprio valor padrão | um padrão que usa outra prop recebe um valor antigo |

## State {#state}

| ✗ Não escreva | ✓ Escreva assim | Por quê |
|---------------|-----------------|-----|
| `state.user.name = "Bo"` | está certo assim | a reatividade é [profunda](/docs/state) |
| `state.todos.push(t)` | está certo assim | mudanças no lugar funcionam e são agrupadas em uma atualização |

## Formulários e eventos {#forms-and-events}

| ✗ Não escreva | ✓ Escreva assim | Por quê |
|---------------|-----------------|-----|
| `<select value="{x}">` | `selected="{x === …}"` em cada `<option>` | `value` no `<select>` não faz nada |
| `<textarea>{state.text}</textarea>` | `<textarea value="{state.text}">` | um textarea faz binding com `value` |
| `state.n = e.target.value` em um campo numérico | `state.n = +e.target.value` | `e.target.value` é sempre texto |
| `new Date(state.date)` em um input de data | `new Date(state.date + "T00:00:00")` | inputs de data dão texto, não um `Date` |
| `state.files.map(…)` | `Array.from(state.files).map(…)` | é um `FileList`, não um array |
| um `contenteditable` que não é salvo no state | copie `textContent` / `innerHTML` para o state | a próxima atualização apaga o que não está no state |
| `onfocus` / `onblur` em um wrapper | coloque-os no campo | focus e blur não propagam |
| `ondragover` sem `preventDefault()` | `ondragover="(e)=> e.preventDefault()"` | senão o drop é recusado |
| `oncopy` / `onpaste` / `onfocusin` como atributos | adicione no `onMount` e remova na limpeza dele | [não suportados como atributos](/docs/events#events-you-must-add-by-hand) |

## Ciclo de vida, refs e roteamento {#lifecycle-refs-and-routing}

| ✗ Não escreva | ✓ Escreva assim | Por quê |
|---------------|-----------------|-----|
| `bind:this` / refs de elementos | `host.querySelector(…)` | não há refs, use [`host`](/docs/lifecycle#host) |
| `use:action` | configure no `onMount` e limpe no retorno dele | não há actions ([limitações](/docs/limitations)) |
| duas chamadas de `onMount(…)` | uma chamada, uma limpeza combinada | só a primeira é usada |
| `push("/shop?tab=" + tab)` para salvar um filtro na URL | `setSearchParam("tab", tab)` | `push()` renderiza a página de novo e reseta o state dela ([detalhes](/docs/router/programmatic-navigation#updating-the-query-without-rendering)) |
