---
title: Importações
group: Componentes
order: 200
source: 0f5ac1d5a82a
---

Importe componentes e qualquer JavaScript dentro de `<script>`, como em um módulo JS comum:

```html title="Component.html"
<script>
  import Navbar from "./components/Navbar";
  import { formatDate } from "./utils";
</script>
```

Importe um componente pelo nome do arquivo **sem** `.html` (cada arquivo `.html` é compilado para um arquivo `.js`).
