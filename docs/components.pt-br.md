---
title: Componentes e props
group: Componentes
order: 160
source: 7b9978640bfb
---

Importe um componente no `<script>` e use-o como uma tag em **PascalCase**. Os atributos que você passa são as **props** dele:

```html title="Parent.html"
<script>
  import StatusBadge from "./StatusBadge";
  import CounterCard from "./CounterCard";
  const state = { score: 5, name: "Ann" };
</script>

<StatusBadge label="Online" color="#16a34a" />
<CounterCard title="Counter" initialValue="{state.score}" />
```

## Passando props {#passing-props}

```html title="Parent.html"
<Comp
  title="Hello"               <!-- "Hello"   → text                         -->
  count="{n + 1}"             <!-- 6         → a real number                -->
  data="{state.user}"         <!-- {...}     → the real object              -->
  greet="Hi {state.name}"     <!-- "Hi Ann"  → text with a value inside     -->
/>
```

- Valor comum → **texto**.
- Só `{expr}` e mais nada → o **valor real** (número, objeto, array, função…).
- Texto misturado com `{expr}` → **texto**.

:::note
Não há atalho de spread (`<Comp {...obj} />`). Passe cada campo: `<Info name="{pkg.name}" version="{pkg.version}" />`.
:::

Os nomes das props precisam ser nomes simples em camelCase (letras, dígitos, `_`). Um nome com hífen como `data-x="1"` não funciona em um componente (o hífen corta o nome). Deixe atributos com hífen para tags HTML normais.

## Lendo props no filho {#reading-props-in-the-child}

Importe `props` de `olum` e pegue o que precisar, no **topo** do `<script>`:

```html title="StatusBadge.html"
<script>
  import { props } from "olum";
  const { label, color } = props();
</script>

<span class="badge" style="color:{color}">{label}</span>
```

Esses nomes **sempre têm o valor mais recente**. Quando o pai passa um valor novo, `label` e `color` atualizam em todo lugar: no template, nas funções, nos handlers de eventos. (O Olum transforma cada uso em uma leitura nova de `props().label` para você. Escrever `props().label` você mesmo também funciona.)

### Valores padrão {#default-values}

Use os valores padrão normais do JavaScript para quando o pai não passa uma prop:

```html title="Nested.html"
<script>
  import { props } from "olum";
  const { answer = "a mystery" } = props();
</script>
<p>The answer is {answer}</p>
```

```html title="Parent.html"
<Nested answer="{42}" />   <!-- The answer is 42 -->
<Nested />                 <!-- The answer is a mystery -->
```

### O que fica atualizado {#what-stays-up-to-date}

```js
const { color } = props();               // ✓ up to date everywhere
const { color: c } = props();            // ✓ renamed: c is the parent's `color`
const { size = "md" } = props();         // ✓ with a default
const { theme: t = "dark" } = props();   // ✓ renamed + default
const { children } = props();            // ✓ slot content (see Slots)
const { onChange } = props();            // ✓ a function prop
```

Uma variável de loop ou um parâmetro de função com o mesmo nome esconde a prop dentro daquele bloco, como no JavaScript normal.

### O que é lido uma vez só {#what-is-only-read-once}

Estes padrões guardam o valor do momento em que o componente foi criado. Eles não dão erro, só não atualizam:

```js
const { a, ...rest } = props();          // ✗ rest is not updated (a still is)
const { user: { name } } = props();      // ✗ nested: use const { user } = props(), then user.name
const { [key]: v } = props();            // ✗ computed key: use props()[key]
onMount(() => {
  const { a } = props();                 // ✗ not at the top of <script>
});
const p = props();
const { a } = p;                         // ✗ indirect: destructure props() directly
const { a, b = a } = props();            // ✗ a default that uses another prop gets an old value
```

## Props de função {#function-props}

Uma prop pode ser uma **função**. É assim que um filho avisa o pai de que algo aconteceu: o pai passa uma função, e o filho a chama.

```html title="Parent.html"
<script>
  import Inner from "./Inner";
  const handleMessage = (payload) => alert(payload.text);
</script>

<Inner onMessage="{handleMessage}" />
```

```html title="Inner.html"
<script>
  import { props } from "olum";
  const { onMessage } = props();
  const sayHello = () => onMessage({ text: "Hello!" });
</script>

<button onclick="sayHello()">Click to say hello</button>
```

### Passe o nome de uma função, nunca código inline {#pass-a-function-name-never-inline-code}

Uma prop de função precisa ser um **nome**: ou uma função de nível superior deste componente, ou um nome que você pegou de `props()` (para passar mais para baixo).

```html title="Parent.html"
<script>
  import Input from "./Input";          // YOUR component (Input.html)
  const handleInput = (e) => (state.text = e.target.value);
</script>

<Input oninput="{handleInput}" />        <!-- ✓ a name -->

<Input oninput="() => console.log(123)" />     <!-- ✗ arrives as the TEXT "() => console.log(123)" -->
<Input oninput="{() => console.log(123)}" />   <!-- ✗ inline function: arrives as undefined -->
<Input oninput="{state.handlers.input}" />     <!-- ✗ not a plain name: arrives as undefined -->
<Input oninput="{makeHandler(id)}" />          <!-- ✗ passes what the call returns, not a function -->
```

O Olum não avisa. O filho falha com `oninput is not a function` quando a chama. A solução é sempre a mesma: dê um nome à função no `<script>` e passe o nome.

:::warn
Esta regra vale **só para os seus componentes** (PascalCase). Em tags HTML normais (minúsculas), `on*` é um evento real do DOM e código inline funciona ([Eventos](/docs/events)):

```html title="Component.html"
<input oninput="e => console.log(123)" />    <!-- ✓ HTML <input>: inline code works -->
<Input oninput="e => console.log(123)" />    <!-- ✗ your <Input/> component: needs "{handler}" -->
```

Até `onclick` é só uma prop em um componente: `<CustomButton onclick="{handleClick}" />` dá uma função ao filho, e o filho decide quando chamá-la (por exemplo, a partir do seu próprio `<button onclick="onclick()">`).
:::

**Precisa que a função saiba de qual item se trata?** Não dá para pré-preencher argumentos na tag. Passe o item como prop e deixe o filho mandá-lo de volta:

```html title="List.html"
<!-- ✗ doesn't work -->
<for each="row of state.rows" key="row.id">
  <Row onPick="{() => pick(row.id)}" />
</for>

<!-- ✓ pass the row; the child calls onPick(row.id) -->
<for each="row of state.rows" key="row.id">
  <Row row="{row}" onPick="{pick}" />
</for>
```

**Passar por um componente intermediário** é só passar a prop de novo:

```html title="Outer.html"
<script>
  import Inner from "./Inner";
  import { props } from "olum";
  const { onMessage } = props();
</script>

<Inner onMessage="{onMessage}" />
```

**Dentro do slot de outro componente** também funciona. O nome é procurado no arquivo onde você escreveu a tag:

```html title="Page.html"
<script>
  import Section from "./Section";
  import Card from "./Card";
  const pick = (id) => (state.picked = id);
</script>

<Section>
  <Card onPick="{pick}" />   <!-- `pick` from Page.html arrives fine -->
</Section>
```

## Props são somente leitura {#props-are-read-only}

Os dados descem **para baixo** pelas props, e as mudanças sobem **para cima** pelas props de função. Um filho não pode mudar uma prop:

- Atribuir `props().x = …` não faz nada (e mostra um aviso).
- Atribuir um nome desestruturado (`color = "x"`) lança `Assignment to constant variable`.

Em vez disso, o pai passa uma função que o filho chama para pedir a mudança:

```html title="Parent.html"
<script>
  import CounterCard from "./CounterCard";
  const state = { score: 0 };
  const setScore = (n) => (state.score = n);
</script>

<CounterCard value="{state.score}" onChange="{setScore}" />
```

```html title="CounterCard.html"
<script>
  import { props } from "olum";
  const { value, onChange } = props();
  const inc = () => onChange(value + 1);
</script>

<button onclick="inc()">{value} +1</button>
```

O pai atualiza o seu `state`, e o novo valor desce de volta até o filho. Exemplo funcionando: [`/forms/callback-props`](/forms/callback-props) (um teclado numérico que edita a senha do pai).

Se **muitos** componentes precisam ler e mudar o mesmo valor, use o [store global](/docs/store/global-store) em vez de passar props por todos os níveis.
