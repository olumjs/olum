---
title: 状态与响应式
group: 响应式
order: 30
source: 28d31ae11591
---

把组件要显示的数据放在 `const state = { ... }` 中。**当你修改 `state` 时，页面会自动更新。**

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
只有 `state` 是响应式的。修改普通的 `const` 或 `let` 变量**不会**更新页面。
:::

## 把 `state` 写成字面量对象 {#write-state-as-a-literal-object}

它必须是顶层的 `const state = { ... }`，并且对象就直接写在那里。`const state = makeState()` 不会被识别，所以什么都不会更新。

## 任意深度的修改都有效 {#changes-at-any-depth-work}

嵌套对象、数组、`Map` 和 `Set` 都会被追踪：

```js
state.user.name = "Bo";          // ✓ nested object
state.user.prefs.theme = "dark"; // ✓ any depth
state.todos.push(todo);          // ✓ array methods (push, splice, sort, …)
state.todos[0].done = true;      // ✓ array item
state.tags.add("new");           // ✓ Map / Set
```

其他类型的对象（`Date`、DOM 元素、类的实例）**不会**被追踪。修改了这类对象后，请给它的键赋一个**新**值：`state.date = new Date(state.date)`。

:::warn
把**同一个**对象赋回去（`state.todos = state.todos`）不会有任何效果，因为什么都没变。要强制更新，请赋一个新的数组或对象（`[...state.todos]`、`map`、`filter`、`slice`、`{ ...obj }`）。
:::

## 派生值就是函数 {#derived-values-are-just-functions}

需要一个根据 state 计算出来的值？写一个函数，并在模板中调用它。它会在每次更新时重新运行，所以始终是最新的。函数之间可以互相调用：

```html title="Component.html"
<script>
  const state = { count: 1 };

  const doubled = () => state.count * 2;
  const quadrupled = () => doubled() * 2;
</script>

<p>{state.count} * 2 = {doubled()}</p>
<p>{doubled()} * 2 = {quadrupled()}</p>
```

## 更新会被合并 {#updates-are-grouped}

连续的多次修改（`state.a++; state.b++`，或者对大数组的一次 `splice`）只会触发**一次**更新，而不是很多次。而且更新只会[修改页面上不同的部分](/docs/rendering)。所以用你觉得最易读的方式修改 `state` 即可；没有任何性能上的理由需要避免 `push` 或 `splice`。

需要注意的是：页面会在你修改之后稍晚一点更新，而不是在同一行代码执行时。如果你需要立刻读取更新后的页面（主要是在测试中），请调用 `flushUpdates()`：

```js
import { flushUpdates } from "olum";

state.count++;
flushUpdates();                         // apply pending updates now
host.querySelector("span").textContent; // up to date
```

:::note
`window.olum.flushUpdates()` 做的是同样的事情，但只在开发环境中可用。在生产环境中，`window.olum` 只有 `version` 和 `framework`（供检测工具使用），所以请改为导入 `flushUpdates`。
:::

[侦听器](/docs/watchers)则不同：它们会立即运行，每次变化运行一次。

修改一个模板从未使用过的 state 键，根本不会更新页面。参见[渲染与更新](/docs/rendering)。
