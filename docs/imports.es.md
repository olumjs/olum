---
title: Importaciones
group: Componentes
order: 200
source: 0f5ac1d5a82a
---

Importa componentes y cualquier JavaScript en `<script>`, como en un módulo JS normal:

```html title="Component.html"
<script>
  import Navbar from "./components/Navbar";
  import { formatDate } from "./utils";
</script>
```

Importa un componente por su nombre de archivo **sin** `.html` (cada archivo `.html` se compila a un archivo `.js`).
