# Olum docs — markdown source (staging)

Each `<slug>.md` here renders one page at `/docs/<slug>` on **olumjs.github.io**.
Files are grouped by the repo they should live in — move each folder's files into
that repo's `docs/` directory (keeping the slug filename, e.g. `docs/router.md`).

The site later pulls them per a manifest entry:

```ts
{ slug: "router", repo: "olumjs/olum-router", path: "docs/router.md" }
// ref is resolved to the repo's DEFAULT BRANCH at fetch time
```

## Frontmatter (required)

```yaml
---
title: State & Reactivity   # page <h1> + sidebar label
group: Reactivity           # sidebar section heading
order: 30                   # global sort order (ascending)
---
```

## Markdown the renderer understands

Standard GitHub-flavored markdown: paragraphs, `**bold**`, `` `inline code` ``,
`- lists`, and GFM `| tables |`. Links to other docs use site-absolute paths:
`[Raw HTML](/docs/raw-html)`.

### Code blocks

A fenced block with a language and an optional `title` (shown in the editor chrome):

````
```html title="Counter.html"
<div>...</div>
```
````

- `title="…"` → filename shown in the code-block header.
- `.html` titles get the HTML syntax highlighter; `bash` / `text` / etc. otherwise.
- Use **4-backtick** fences when the code itself contains backticks.

### Callouts

Container directives map to the colored boxes on the site:

| Directive   | Box            | Default icon |
|-------------|----------------|--------------|
| `:::tip`    | green          | 💡           |
| `:::warn`   | yellow         | ⚠️           |
| `:::danger` | red            | 🚨           |
| `:::note`   | neutral card   | none         |

Optional title and icon override:

```
:::tip[The design principle]
Body markdown here…
:::

:::danger{icon="🔒"}
Never pass untrusted content to `html=`.
:::
```
