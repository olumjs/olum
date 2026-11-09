---
title: Props 与方法的作用域
group: 组件
order: 210
source: 407ccaae6156
---

默认情况下，组件 `<script>` 中的一切都是**私有的**：其他代码看不到。你可以把其中一部分设为**公开**，这样 [`scope()`](#reading-a-component-from-outside-scope) 就能从外部读取它们。

:::note
在本页中，**"props"** 指的是组件顶层的 `const` 值（不是父组件传入的 `props()`），**"methods"** 指的是它的函数。
:::

- **Props**：值很简单的顶层 `const`（字面量、对象、数组、三元表达式或另一个名称）。
- **Methods**：顶层函数（`function fn() {}` 或 `const fn = () => …`）。
- 其他内容（比如 `const x = compute()`）在组件内部照常工作，只是不能设为公开。
- `state` 算作一个 prop。

## 设为公开 {#making-things-public}

在 `<script>` 标签上加一个关键字：

```html title="Component.html"
<script public> … </script>            <!-- all props AND methods public -->
<script public-props> … </script>      <!-- only props public -->
<script public-methods> … </script>    <!-- only methods public -->

<script private> … </script>           <!-- everything private (the default) -->
<script private-props> … </script>
<script private-methods> … </script>
```

## 用 `exclude-*` 设置例外 {#exceptions-with-exclude-}

`exclude-<name>` 会把**某一项**翻转成与其所在组相反的设置：

| 在……之后 | `exclude-x` 让 `x` 变成…… |
|--------|------------------------|
| `public`、`public-props`、`public-methods` | 私有 |
| `private`、`private-props`、`private-methods` | 公开 |

```html title="Component.html"
<script public-props exclude-age exclude-name private-methods exclude-get-age>
  const age     = 30;
  const name    = "Ann";
  const role    = "admin";

  const getAge  = () => age;
  const getRole = () => role;
</script>

<!--
  props:   public, except age and name  →  role is public
  methods: private, except getAge       →  getAge is public
-->
```

:::tip
要在其他 props 公开的同时保持 `state` 私有，在 `public-props` 后面加上 `exclude-state`。
:::

### 顺序很重要 {#order-matters}

属性是**从左到右**读取的。每个关键字开始一个组，它后面的 `exclude-*` 都属于这个组，直到下一个关键字为止：

```text title="reading order"
public-props   exclude-age   exclude-name   private-methods   exclude-get-age
└──────────── props group ───────────────┘  └──────── methods group ───────┘
```

### 名称用 kebab-case 书写 {#write-names-in-kebab-case}

HTML 属性名不区分大小写，所以要把 camelCase 名称写成带短横线的形式。Olum 会把它们转换回来：

```text title="naming"
getAge    →  exclude-get-age
userName  →  exclude-user-name
isActive  →  exclude-is-active
```

## 从外部读取组件：`scope()` {#reading-a-component-from-outside-scope}

`scope()` 会按名称找到**页面上**的组件，可以在任何地方调用（另一个组件、控制台、测试）：

```js
import { scope } from "olum";

const badge = scope("StatusBadge");
badge.props;    // its PUBLIC props
badge.methods;  // its PUBLIC methods
badge.state;    // its live state (changing it updates that component)
badge.el;       // its root element
badge.key;      // its internal instance key
```

- 页面上有多个？传入是第几个：`scope("Item", 2)`。
- 没找到 → 返回 `null` 并打印一条警告。

:::tip
`scope()` 是一个应急出口。对于多个组件有意共享的数据，请使用[全局 store](/docs/store/global-store)。
:::
