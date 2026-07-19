---
title: Router
group: Routing
order: 170
---

Olum uses **file-based routing** — every route is a folder under `src/` and the files inside it declare how that URL renders. There is no route config to maintain: the file tree **is** the route table.

```text title="Project structure"
src/
├── page.html                 → /
├── not-found.html            → Global 404 page
│
├── about/
│   └── page.html             → /about
│
├── blog/
│   ├── page.html             → /blog
│   └── [slug]/
│       └── page.html         → /blog/:slug
│
├── users/
│   ├── page.html             → /users
│   └── [id]/
│       └── page.html         → /users/:id
│
├── (marketing)/              → route group — not part of the URL
│   └── pricing/
│       └── page.html         → /pricing
│
├── 01-guide/                 → numeric ordering prefix — stripped from the URL
│   └── page.html             → /guide
│
├── _drafts/                  → skipped entirely (leading underscore)
│   └── page.html             → (no route)
│
├── components/               → skipped entirely (reserved folder)
│   └── AddTodo.html          → (no route)
│
└── utils/                    → skipped entirely (reserved folder)
    └── helpers.js            → (no route)
```

## Folder conventions

Some folder names change how (or whether) routes are generated:

| Folder | Effect |
|--------|--------|
| `(group)/` | **Route group** — organizes files without affecting the URL. `(marketing)/pricing/page.html` serves `/pricing`, not `/(marketing)/pricing`. |
| `01-name/` | **Ordering prefix** — leading digits followed by a dash are stripped from the URL. `01-guide/page.html` serves `/guide`. Handy for keeping folders sorted on disk. |
| `_name/` | **Skipped entirely** — a folder starting with `_` (and everything inside it) never produces a route. Use it for drafts or work in progress. |
| `components/`, `utils/` | **Skipped entirely** — these reserved folders are excluded from routing at any depth, so shared components and helpers can live next to your pages without becoming routes. |

:::tip
Only the `NN-` prefix is stripped — digits elsewhere in a segment are kept as-is, so a folder like `7guis/` still serves `/7guis`.
:::

## Opting out — your own `main.js`

You don't need to write an entry point at all: **omit `src/main.js` and the file-based router
above is set up for you out of the box** — the route table is compiled into an auto-generated
`src/main.js`. If you create `src/main.js` yourself, the compiler **skips** that generation
entirely and uses your file as the entry point — useful when you don't need routing and want
to drop `olum-router`.

Your `main.js` must then mount the app itself. If a single route is all you need, this is the
whole setup — and you can remove `olum-router` from `package.json` entirely:

```js title="src/main.js"
import Olum from "olum";
import page from "./page.js";

new Olum().$("#app").use(page);
```

If you instead want to configure the router **yourself** (your own route table instead of the
generated one), the full setup looks like this — the same shape the auto-generated `main.js`
has. As written it still mounts a single component; uncomment the three router lines (and
remove the last line) to route manually:

```js title="src/main.js"
import Olum from "olum";
// import Router from "olum-router";

import Home from "./page.js";
import About from "./about/page.js";

export const routes = [
  { path: "/", comp: Home },
  { path: "/about", comp: About }
];

// const config = { mode: "history", root: "/", routes: routes };
// const router = new Router(config);
// new Olum().$("#app").use(router);
new Olum().$("#app").use(Home);
```

If you also have a `not-found.html`, give it a route (`{ path: "/404", comp: NotFound }`) and
add `err: "/404"` to the config — see [History Mode & the 404 Page](/docs/history-mode-and-404).

:::note
Components are authored as `.html` files but compiled to `.js` modules, so your imports
reference the compiled name — `src/page.html` is imported as `./page.js`.
:::

:::note
After each route's view mounts, the router dispatches a `viewLoaded` event on `window` — handy for analytics or scroll restoration: `window.addEventListener("viewLoaded", () => scrollTo(0, 0))`.
:::
