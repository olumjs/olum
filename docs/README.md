# Writing these docs

Each `.md` file in this folder is one page on **olumjs.github.io**. This README is not shown on the site.

## Where pages come from

- These folders are the source. `npm run sync` (`scripts/index.js`) copies each one into its package repo's `docs/` folder (the old folder is deleted first):

  | Folder here | Repo | Site section |
  |-------------|------|--------------|
  | `docs/olum/` | `olumjs/olum` | `/docs/core/…` |
  | `docs/router/` | `olumjs/olum-router` | `/docs/router/…` |
  | `docs/store/` | `olumjs/olum-store` | `/docs/store/…` |
  | `docs/transition/` | `olumjs/olum-transition` | `/docs/transition/…` |

- The website reads them **live from GitHub**: each released version is a branch (`v0.13.0`), and the site lists that branch's `docs/` folder. Edits show up once a new version is released.
- `core` also has a `get-started` page (order 0) that lives in the website repo (`public/content/get-started.md`).

## File names are URLs

`state.md` is served at `/docs/core/state`. **Renaming a file changes its URL** and breaks links to it (the site, search engines, the website's own hard-coded links). Only rename when it's really worth it.

## Frontmatter (required)

```yaml
---
title: State & Reactivity   # page <h1> + sidebar label
group: Reactivity           # sidebar heading
order: 30                   # sort order, inside this package only
---
```

- `order` only matters **within one folder**. Use steps of 10 so a page can be added in between.
- Groups appear in the order of their **first** page.

## The first paragraph is the page description

The site uses the page's first paragraph as its `<meta name="description">` (cut at ~155 characters). So start every page with **one plain sentence that sums it up**, not a callout, table, heading or code block.

## Links

- Same package: `/docs/<slug>`, e.g. `[Raw HTML](/docs/raw-html)`.
- Another package: `/docs/<pkg>/<slug>`, e.g. `[global store](/docs/store/global-store)`. (A short `/docs/<slug>` also works, but costs a redirect.)
- A section: `/docs/state#changes-at-any-depth-work`. Anchors are GitHub-style: lowercase, punctuation removed, each space becomes `-` (so `a — b` → `a--b`).
- Runnable examples: `/<group>/<example>`, e.g. `[/forms/files](/forms/files)`, opens in the playground.

## Markdown

GitHub-flavored markdown: paragraphs, `**bold**`, `` `code` ``, lists and tables. Raw HTML in the text is shown as text, never rendered.

### Code blocks

````
```html title="Counter.html"
<div>...</div>
```
````

- `title="…"` is shown as the file name above the block.
- Highlighted languages: `html` (Olum templates), `js`, `json`, `ts`, `jsx`. Anything else (`bash`, `text`, `css`) is plain.
- Use a **4-backtick** fence when the code itself contains backticks.

### Callouts

| Directive   | Box     | Default title |
|-------------|---------|---------------|
| `:::tip`    | green   | Tip           |
| `:::note`   | neutral | Note          |
| `:::warn`   | yellow  | Heads up      |
| `:::danger` | red     | Careful       |

A custom title and icon are optional:

```
:::tip[The one rule to remember]
Body markdown here…
:::

:::danger{icon="🔒"}
Never pass untrusted content to `html=`.
:::
```

## Style

Write for a beginner who knows HTML, CSS and a little JavaScript:

- One-sentence intro, then an example, then a short "Good to know" list.
- Short sentences and everyday words ("the page updates", not "a re-render is scheduled").
- Show ✓ / ✗ examples for common mistakes.

## After editing

`llms.txt` is a hand-written summary of these docs. Update it to match, then run `npm run llms:bless` (`npm run llms:check` fails until you do).
