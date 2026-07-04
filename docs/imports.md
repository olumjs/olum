---
title: Imports
group: Components
order: 150
---

Import child components (and any JS) in `<script>`. Import a component by its file name (the `.html` compiles to `.js`):

```html title="Component.html"
<script>
  import Navbar from "./components/Navbar";
  import { formatDate } from "./utils";
</script>
```
