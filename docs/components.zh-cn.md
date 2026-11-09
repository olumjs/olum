---
title: 组件与 Props
group: 组件
order: 160
source: 7b9978640bfb
---

在 `<script>` 中导入组件，然后把它当作 **PascalCase** 标签使用。你给它的属性就是它的 **props**：

```html title="Parent.html"
<script>
  import StatusBadge from "./StatusBadge";
  import CounterCard from "./CounterCard";
  const state = { score: 5, name: "Ann" };
</script>

<StatusBadge label="Online" color="#16a34a" />
<CounterCard title="Counter" initialValue="{state.score}" />
```

## 传递 props {#passing-props}

```html title="Parent.html"
<Comp
  title="Hello"               <!-- "Hello"   → text                         -->
  count="{n + 1}"             <!-- 6         → a real number                -->
  data="{state.user}"         <!-- {...}     → the real object              -->
  greet="Hi {state.name}"     <!-- "Hi Ann"  → text with a value inside     -->
/>
```

- 普通值 → **文本**。
- 只有 `{expr}`，没有其他内容 → **真实的值**（数字、对象、数组、函数……）。
- 文本中混有 `{expr}` → **文本**。

:::note
没有展开的简写（`<Comp {...obj} />`）。请逐个字段传递：`<Info name="{pkg.name}" version="{pkg.version}" />`。
:::

prop 名称必须是 camelCase 的简单名称（字母、数字、`_`）。像 `data-x="1"` 这样带短横线的名称在组件上无效（短横线会截断名称）。带短横线的属性请只用在普通 HTML 标签上。

## 在子组件中读取 props {#reading-props-in-the-child}

从 `olum` 导入 `props`，并在 `<script>` 的**顶部**取出你需要的值：

```html title="StatusBadge.html"
<script>
  import { props } from "olum";
  const { label, color } = props();
</script>

<span class="badge" style="color:{color}">{label}</span>
```

这些名称**始终是最新的值**。当父组件传入新值时，`label` 和 `color` 会在所有地方更新：模板中、函数中、事件处理函数中。（Olum 会帮你把每次使用都变成一次新的 `props().label` 读取。你自己写 `props().label` 也可以。）

### 默认值 {#default-values}

当父组件没有传某个 prop 时，使用普通的 JavaScript 默认值：

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

### 哪些写法会保持最新 {#what-stays-up-to-date}

```js
const { color } = props();               // ✓ up to date everywhere
const { color: c } = props();            // ✓ renamed: c is the parent's `color`
const { size = "md" } = props();         // ✓ with a default
const { theme: t = "dark" } = props();   // ✓ renamed + default
const { children } = props();            // ✓ slot content (see Slots)
const { onChange } = props();            // ✓ a function prop
```

同名的循环变量或函数参数会在那个代码块中遮蔽这个 prop，和普通 JavaScript 一样。

### 哪些写法只读取一次 {#what-is-only-read-once}

这些写法会保留组件创建时的值。它们不会报错，只是不会更新：

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

## 函数 props {#function-props}

prop 可以是一个**函数**。子组件就是靠这种方式告诉父组件发生了什么：父组件传入一个函数，子组件调用它。

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

### 传函数名，永远不要传内联代码 {#pass-a-function-name-never-inline-code}

函数 prop 必须是一个**名称**：要么是本组件的顶层函数，要么是你从 `props()` 中拿到的名称（用来继续往下传）。

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

Olum 不会给你警告。子组件在调用它时会以 `oninput is not a function` 失败。解决办法始终一样：在 `<script>` 中给函数起个名字，然后传这个名字。

:::warn
这条规则**只适用于你自己的组件**（PascalCase）。在普通 HTML 标签（小写）上，`on*` 是真正的 DOM 事件，写内联代码没有问题（[事件](/docs/events)）：

```html title="Component.html"
<input oninput="e => console.log(123)" />    <!-- ✓ HTML <input>: inline code works -->
<Input oninput="e => console.log(123)" />    <!-- ✗ your <Input/> component: needs "{handler}" -->
```

即使是 `onclick`，在组件上也只是一个 prop：`<CustomButton onclick="{handleClick}" />` 会给子组件一个函数，由子组件决定何时调用它（比如在它自己的 `<button onclick="onclick()">` 中）。
:::

**需要函数知道它对应的是哪一项？** 你不能在标签中预先填入参数。把这一项作为 prop 传入，让子组件把它传回来：

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

**经过中间组件传递**，就是再传一次这个 prop：

```html title="Outer.html"
<script>
  import Inner from "./Inner";
  import { props } from "olum";
  const { onMessage } = props();
</script>

<Inner onMessage="{onMessage}" />
```

**在另一个组件的插槽内部**也照样有效。名称会在你写这个标签的文件中查找：

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

## Props 是只读的 {#props-are-read-only}

数据通过 props **向下**流动，修改通过函数 props **向上**传递。子组件不能修改 prop：

- 赋值 `props().x = …` 不会有任何效果（并会打印一条警告）。
- 给解构出来的名称赋值（`color = "x"`）会抛出 `Assignment to constant variable`。

正确的做法是：父组件传入一个函数，子组件调用它来请求修改：

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

父组件更新它的 `state`，新值再流回子组件。可运行的示例：[`/forms/callback-props`](/forms/callback-props)（一个编辑父组件密码的数字键盘）。

如果**很多**组件需要读取和修改同一个值，请使用[全局 store](/docs/store/global-store)，而不是一层层地传递 props。
