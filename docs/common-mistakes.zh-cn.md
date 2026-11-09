---
title: 常见错误
group: 进阶
order: 280
source: 81301d5481bf
---

Olum 做每件事都只有**一种方式**，而且值总是放在**引号里**。下面是从其他框架转过来的人经常写错的地方。

## 模板语法 {#template-syntax}

| ✗ 不要这样写 | ✓ 应该这样写 | 原因 |
|---------------|-----------------|-----|
| `when={x}` / `each={x}` | `when="x"` / `each="x"` | 值要放在 `""` 中 |
| `value={state.x}` | `value="{state.x}"` | 文本属性 + `{}` |
| `:title="x"` | `title="{x}"` | 没有 `:` 绑定 |
| `:style="{…}"` | `style="color:{x}; …"` | style 是文本 + `{}` |
| `<img {src} />` | `<img src="{src}" />` | 没有简写 |
| `oninput={(e)=>…}` | `oninput="(e)=>…"` | 事件要放在 `""` 中 |
| `mode="prevent"` | 在处理函数中调用 `e.preventDefault()` | 没有事件修饰符 |
| `model="state.x"` | `value="{state.x}"` + `oninput` | [手动绑定](/docs/two-way-binding) |
| 文本中的字面量 `{` | `{String.fromCharCode(123)}` | 任何 `{…}` 都是代码 |
| `each="i of state.n"` | `each="i of Array.from({length: state.n}, (_, k) => k + 1)"` | 计数必须是直接写出的数字 |
| `url(assets/x.svg)` / `src="assets/…"` | `url(/assets/x.svg)` | 文件 URL [以 `/` 开头](/docs/static-assets) |
| 一个元素上写 `oninput="…" onblur="…"` | 这样写没问题 | 一个元素可以有多个 `on*` |

## 组件与 props {#components-and-props}

| ✗ 不要这样写 | ✓ 应该这样写 | 原因 |
|---------------|-----------------|-----|
| `<comp/>` | `<Comp/>` | 组件使用 PascalCase |
| `<Comp {a} />` / `<Comp a={a} />` | `<Comp a="{a}" />` | 没有简写，值放在 `""` 中 |
| `<Comp {...obj} />` | `<Comp a="{obj.a}" b="{obj.b}" />` | 没有展开语法，逐个字段传递 |
| `<Comp onX="(e)=>…" />` | `<Comp onX="{handler}" />` | 在组件上，`on*` 是一个 prop；箭头函数会以文本形式传过去 |
| `<Comp onX="{(e)=>…}" />` / `<Comp onX="{obj.fn}" />` | 给函数起个名字，传入这个名字 | [函数 prop](/docs/components#function-props) 必须是一个名称，否则传过去是 `undefined` |
| `const { color } = props(); color = "x"` | `const { onChange } = props(); onChange("x")` | props 是只读的（赋值会抛错） |
| `const { a, ...rest } = props()` | 额外的值用 `props()` 读取 | `rest` [永远不会更新](/docs/components#what-is-only-read-once) |
| `const { user: { name } } = props()` | `const { user } = props()`，然后用 `user.name` | 嵌套的解构模式不会更新 |
| `const { [key]: v } = props()` | `props()[key]` | 计算属性名不会更新 |
| `const p = props(); const { a } = p` | `const { a } = props()` | 直接解构 `props()` |
| `onMount(() => { const { a } = props(); … })` | 在 `<script>` 顶部解构 | 在函数内部只会读取一次 |
| `const { a, b = a } = props()` | 给 `b` 单独的默认值 | 使用另一个 prop 的默认值会拿到旧值 |

## State {#state}

| ✗ 不要这样写 | ✓ 应该这样写 | 原因 |
|---------------|-----------------|-----|
| `state.user.name = "Bo"` | 这样写没问题 | 响应式是[深层的](/docs/state) |
| `state.todos.push(t)` | 这样写没问题 | 原地修改有效，并且会合并成一次更新 |

## 表单与事件 {#forms-and-events}

| ✗ 不要这样写 | ✓ 应该这样写 | 原因 |
|---------------|-----------------|-----|
| `<select value="{x}">` | 在每个 `<option>` 上写 `selected="{x === …}"` | `<select>` 上的 `value` 不起作用 |
| `<textarea>{state.text}</textarea>` | `<textarea value="{state.text}">` | textarea 用 `value` 绑定 |
| 在数字字段上写 `state.n = e.target.value` | `state.n = +e.target.value` | `e.target.value` 总是文本 |
| 对日期输入框用 `new Date(state.date)` | `new Date(state.date + "T00:00:00")` | 日期输入框给出的是文本，不是 `Date` |
| `state.files.map(…)` | `Array.from(state.files).map(…)` | 它是 `FileList`，不是数组 |
| 没有保存到 state 的 `contenteditable` | 把 `textContent` / `innerHTML` 复制到 state 中 | 下一次更新会清掉不在 state 中的内容 |
| 在包裹元素上写 `onfocus` / `onblur` | 写在字段本身上 | focus 和 blur 不会冒泡 |
| 没有 `preventDefault()` 的 `ondragover` | `ondragover="(e)=> e.preventDefault()"` | 否则放置会被拒绝 |
| 把 `oncopy` / `onpaste` / `onfocusin` 写成属性 | 在 `onMount` 中添加，在它的清理函数中移除 | [不支持写成属性](/docs/events#events-you-must-add-by-hand) |

## 生命周期、ref 与路由 {#lifecycle-refs-and-routing}

| ✗ 不要这样写 | ✓ 应该这样写 | 原因 |
|---------------|-----------------|-----|
| `bind:this` / 元素 ref | `host.querySelector(…)` | 没有 ref，请使用 [`host`](/docs/lifecycle#host) |
| `use:action` | 在 `onMount` 中设置，在它的返回值中清理 | 没有 action（[限制](/docs/limitations)） |
| 两次 `onMount(…)` 调用 | 一次调用，一个合并后的清理函数 | 只有第一次会生效 |
| 用 `push("/shop?tab=" + tab)` 把筛选条件存到 URL | `setSearchParam("tab", tab)` | `push()` 会重新渲染页面并重置它的状态（[详情](/docs/router/programmatic-navigation#updating-the-query-without-rendering)） |
