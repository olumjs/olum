---
title: Escaping & Security
group: Advanced
order: 250
---

Olum protects you from XSS (injected scripts) by default: every value is escaped unless you opt out on purpose.

- **By default**, every `{expr}` in text and attributes is HTML-escaped (with `olum.esc`). So `<script>` in user data shows as text and can't run, and characters like `<` or `"` can't break your page.
- **To insert real HTML** (trusted content only), use `html="expr"` on an element or `olum.html(value)` inline. See [Raw HTML](/docs/raw-html).
- **Slot content** (`children`) is inserted as HTML, because it comes from your own template. See [Slots](/docs/slots).

:::danger{icon="🔒"}
Never pass user content to `html=` or `olum.html()`. If you must show user-supplied HTML, sanitize it first.
:::
