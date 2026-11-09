---
title: 导入
group: 组件
order: 200
source: 0f5ac1d5a82a
---

在 `<script>` 中导入组件和任意 JavaScript，就像在普通的 JS 模块中一样：

```html title="Component.html"
<script>
  import Navbar from "./components/Navbar";
  import { formatDate } from "./utils";
</script>
```

导入组件时使用文件名，**不要**带 `.html`（每个 `.html` 文件都会被编译成一个 `.js` 文件）。
