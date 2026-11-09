---
title: 侦听器
group: 响应式
order: 50
source: e67e52f5534e
---

侦听器会在某个 `state` 键变化时运行你的代码。声明 `const watcher = { ... }`，每个键对应一个函数。每个函数都会收到旧值和新值：

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

侦听器会**立即**运行，每次变化运行一次（页面更新会被合并，侦听器不会）。

:::warn
只有当你**直接给这个键赋值**时侦听器才会运行：`state.user = ...`。像 `state.user.name = "Bo"` 或 `state.todos.push(t)` 这样的嵌套修改会更新页面，但**不会**触发侦听器。如果需要触发侦听器，就赋一个新值：`state.user = { ...state.user, name: "Bo" }`。
:::
