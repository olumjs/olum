---
title: Escaping & Security
group: Advanced
order: 200
---

OlumJS escapes by default to prevent XSS. Opt out deliberately when you need raw HTML.

- **Default:** every text/attribute `{expr}` is HTML-escaped via `olum.esc` (prevents XSS and "special characters break the page" bugs).
- **Opt out** (trusted HTML only): `html="expr"` (element) or `olum.html(value)` (inline). Both are the deliberate, greppable bypass.

:::danger{icon="🔒"}
Never pass untrusted user content to `html=` or `olum.html()`. Sanitize first if you must render user-supplied HTML.
:::
