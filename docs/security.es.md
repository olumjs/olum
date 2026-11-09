---
title: Escapado y seguridad
group: Avanzado
order: 250
source: d8626fdc23d9
---

Olum te protege de XSS (scripts inyectados) por defecto: cada valor se escapa a menos que lo desactives a propósito.

- **Por defecto**, cada `{expr}` en el texto y en los atributos se escapa como HTML (con `olum.esc`). Así, un `<script>` en los datos del usuario se muestra como texto y no puede ejecutarse, y caracteres como `<` o `"` no pueden romper tu página.
- **Para insertar HTML real** (solo contenido de confianza), usa `html="expr"` en un elemento u `olum.html(value)` en línea. Consulta [HTML sin escapar](/docs/raw-html).
- **El contenido de los slots** (`children`) se inserta como HTML, porque viene de tu propia plantilla. Consulta [Slots](/docs/slots).

:::danger{icon="🔒"}
Nunca pases contenido del usuario a `html=` ni a `olum.html()`. Si tienes que mostrar HTML que envía el usuario, sanitízalo primero.
:::
