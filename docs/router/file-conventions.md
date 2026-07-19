---
title: File Conventions
group: Routing
order: 180
---

| File | What it does |
|------|--------------|
| `page.html` | The UI for a route. A folder becomes a navigable route only when it contains a `page.html` — e.g. `about/page.html` serves `/about`. |
| `not-found.html` | Rendered when no route matches the current URL — the global 404 page. |
| `[param]/` | A dynamic segment. `blog/[slug]/page.html` matches `/blog/:slug`, capturing the URL part as the `slug` param (e.g. `/blog/hello` → `slug = "hello"`). |
| `(group)/` | A route group. The parenthesized folder is dropped from the URL — `(marketing)/pricing/page.html` serves `/pricing`. Use it to organize related routes without nesting the URL. |
| `01-name/` | A numeric ordering prefix (digits + dash) is stripped from the URL — `01-guide/page.html` serves `/guide`. Digits elsewhere in the name are kept (`7guis/` still serves `/7guis`). |
| `_name/` | Skipped entirely. A folder starting with `_` never produces routes, no matter what it contains. |
| `components/`, `utils/` | Skipped entirely. These reserved folder names are excluded from routing at any depth — shared components and helpers never become routes. |

:::warn
These filenames are **case-sensitive**. It must be exactly `page.html` and `not-found.html` (all lowercase) — variants like `Page.html` or `Not-Found.html` are not recognized.
:::

:::tip
Reusable components live in the `src/components` directory and their filenames are **PascalCase** — e.g. `src/components/AddTodo.html`. This keeps route files (`page.html` / `not-found.html`) separate from the components they render.
:::
