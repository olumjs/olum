---
title: Imports
group: Components
order: 200
---

Import components and any JavaScript in `<script>`, like in a normal JS module:

```html title="Component.html"
<script>
  import Navbar from "./components/Navbar";
  import { formatDate } from "./utils";
</script>
```

Import a component by its file name **without** `.html` (each `.html` file is compiled to a `.js` file).
