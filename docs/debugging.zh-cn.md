---
title: 调试
group: 模板语法
order: 150
source: 68f554f1ee61
---

## `<log>`：值变化时打印它 {#log-print-a-value-when-it-changes}

在模板的任意位置放一个 `<log>{expr}</log>`。组件首次出现时，以及**每次该值变化时**，它都会运行 `console.log(expr)`。它不会在页面上显示任何内容。（类似 Svelte 的 `{@debug}`。）

```html title="Component.html"
<script>
  const state = { user: { firstname: "Ada", lastname: "Lovelace" } };
</script>

<input value="{state.user.firstname}" oninput="(e) => state.user.firstname = e.target.value" />

<log>{state.user}</log>

<h1>Hello {state.user.firstname}!</h1>
```

打开浏览器控制台，在输入框里打字：每次变化都会打印 `user`。

- 用逗号打印多个值：`<log>{state.a, state.b}</log>` 会变成 `console.log(state.a, state.b)`。
- 只有当**它读取的** state 键变化时才会打印。`state.y` 变化时，`<log>{state.x}</log>` 保持安静。

如果需要更多控制（比如只在某个条件下暂停），把 `debugger;` 或 `console.log` 放进一个[侦听器](/docs/watchers)里。
