---
title: Page Metadata & SEO
group: Getting Started
order: 25
---

A page declares its own `<head>` — title, description, Open Graph, Twitter cards, canonical, JSON-LD — right inside its `page.html`, next to the markup that uses the same data.

```html title="src/blog/[slug]/page.html"
<head>
  <title>{post.title} — My Blog</title>
  <meta name="description" content="{post.excerpt}" />
  <link rel="canonical" href="https://example.com/blog/{slug}" />

  <meta property="og:title" content="{post.title}" />
  <meta property="og:image" content="{post.cover}" />
  <meta name="twitter:card" content="summary_large_image" />
</head>

<script>
  import { params } from "olum";
  import { getPost } from "../../api.js";

  const { slug } = params();
  const post = getPost(slug);
</script>

<article>
  <h1>{post.title}</h1>
  {post.body}
</article>
```

The `<head>` block is compiled like `<style>` is: it is lifted out of the markup and turned into a function that runs **inside the component's closure**. So every `{expr}` reads the same `state`, `params()`, `props()` and consts your template reads — the metadata is as dynamic as the page.

## Only page components own the head

A document has one head, and one URL shows one page — so only the component the router mounts may declare one:

| File | `<head>` allowed |
|------|------------------|
| `page.html` | ✅ yes |
| `not-found.html` | ✅ yes |
| `src/components/Card.html` and every other component | ❌ ignored, with a build warning |

A `<head>` in a child component is dead code — it would never be applied — so the compiler drops it and tells you which file to move it to.

:::warn
The block must be **closed**: `<head> … </head>`. An unclosed `<head>` is ignored (with a warning) rather than swallowing the rest of the file. Only the **first** `<head>` in a file is compiled; a second one is dropped.
:::

## How it merges with `public/index.html`

`public/index.html` is the **baseline**. Your page's tags are merged over it:

- A tag that occupies the **same slot** replaces the baseline tag, **in its original position**.
- A tag with no counterpart is **appended**.
- Nothing else in the head is touched — including the `<style>` blocks Olum injects for scoped CSS, and the bundler's own `<script>` / `<link>` tags.

What counts as "the same slot":

| Tag | Slot |
|-----|------|
| `<title>`, `<base>` | the tag itself — one per document |
| `<meta charset>` | `charset` |
| `<meta name="…">`, `<meta property="…">`, `<meta http-equiv="…">`, `<meta itemprop="…">` | that name/property |
| `<link rel="canonical" \| "icon" \| "apple-touch-icon" \| "manifest" \| "amphtml">` | that `rel` — one per document |
| `<link rel="stylesheet" \| "preload" \| "preconnect" \| …>` | `rel` **+ `href`** — repeatable, so a page **adds** a stylesheet instead of replacing the site's |
| `<script type="application/ld+json">` | one block per page (add an `id` if you need several) |

The rule in one line: **a tag your page declares replaces the shell's tag of the same kind; every other shell tag is left exactly as it was.**

Worked through. Your shell:

```html title="public/index.html"
<head>
  <title>Olum Project</title>
  <meta charset="UTF-8" />
  <meta name="description" content="A site built with Olum" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="/main.css" />
</head>
```

Your page:

```html title="src/blog/hello/page.html"
<head>
  <title>Hello — My Blog</title>
  <meta name="description" content="The first post" />
  <meta property="og:title" content="Hello" />
</head>
```

What the document ends up with:

| Shell tag | Page declares | Outcome |
|-----------|---------------|---------|
| `<title>Olum Project</title>` | a `<title>` | **replaced** — page's title, in the shell title's position |
| `<meta name="description">` | same `name` | **replaced** — `"The first post"` |
| `<meta charset>` | — | **untouched** |
| `<meta name="viewport">` | — | **untouched** |
| `<link rel="stylesheet" href="/main.css">` | — | **untouched** |
| — | `<meta property="og:title">` | **appended** — the shell had no counterpart |

Nothing is ever deleted just because your page didn't mention it. A shell tag is only displaced when your page declares one that fills the same slot, and even then it is [kept, not destroyed](#navigating-away-is-always-clean), so the next route gets it back.

`not-found.html` behaves identically — it is a page like any other, so your 404 can set its own `<title>` and `robots` without leaking them into the next route.

:::tip
This is why the shell is the right home for site-wide tags — `charset`, `viewport`, the favicon, the stylesheet, `theme-color` — and a page's `<head>` should carry only what is specific to that page. Anything you don't repeat, you keep.
:::

### Navigating away is always clean

Every route mount **restores the baseline first, then applies the new page's head**. It is never a diff between two pages, so a `<meta property="og:image">` from the blog post you just left can never linger on the pricing page you navigated to. A page with no `<head>` of its own resets the head back to exactly what `public/index.html` shipped.

:::note
Displaced baseline tags are parked in an inert `<template data-olum-head>` inside the head rather than thrown away — that is what lets a [prerendered](/docs/prerendering) page restore its own baseline. It is not applied, not fetched, and not read by crawlers. Tags a page contributes carry a `data-olum-head` attribute for the same reason. Both are harmless bookkeeping; ignore them.
:::

## Structured data (JSON-LD)

JSON-LD is the one place where `{` means data, not an interpolation. Inside a `<script type="application/ld+json">` block:

- a bare `{` stays **plain JSON**;
- `{expr}` is compiled **only inside a double-quoted string** — a place where a raw `{` can never legally appear, so there is no ambiguity;
- those values are inserted **raw** (not HTML-escaped), so the JSON stays valid.

```html title="src/match/[slug]/page.html"
<head>
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "SportsEvent",
      "name": "{match.name}",
      "url": "https://example.com/match/{slug}",
      "startDate": "{match.kickoff}"
    }
  </script>
</head>
```

:::warn
Because the value is inserted raw, a `"` or `\` in the data would break the JSON. For anything user-supplied, build the block from a string you control — e.g. `{JSON.stringify(match.name)}` **without** the surrounding quotes in the template.
:::

## Escaping rules everywhere else

Outside a JSON-LD block, `{expr}` behaves exactly like it does in your markup: the value is **HTML-escaped** before it is inserted, so a quote or an angle bracket in a description can't break out of the attribute.

A few literal characters need care, same as in the template:

| You write | You get | Why |
|-----------|---------|-----|
| `` ` `` | a literal backtick | escaped for you |
| `\` | a literal backslash | escaped for you |
| `${x}` | `$` + the value of `{x}` | `$` is literal, `{x}` is still an interpolation |

## It follows your state

The head is rendered output, exactly like the markup. When the page re-renders, the head re-renders with it — in development **and** in production. A state key the head reads is a render dependency like any other, so this works with no extra step:

```html title="src/blog/[slug]/page.html"
<head>
  <title>{state.post.title} — My Blog</title>
</head>

<script>
  import { onMount } from "olum";
  const state = { post: { title: "Loading…" } };

  onMount(async () => {
    state.post = await fetchPost();   // the title follows
  });
</script>
```

The tab title says `Loading… — My Blog`, then flips to the real one when the fetch lands — the same way `<h1>{state.post.title}</h1>` would.

Only the **page** component drives this. A re-render of a child component never touches the head, and the head is only re-applied when the markup it produces actually changed — so an unrelated state write costs one template literal, not a rebuilt head.

:::warn
Reactivity is not what makes a page indexable. Social unfurlers (Twitter, Slack, Facebook, LinkedIn) never run JavaScript — they read the file. For metadata a crawler can see, the route has to be [prerendered](/docs/prerendering) — and a title built from an `await` only reaches the built file if the build waited for that data, which is what `olum.SSG_DELAY` is for.
:::

## Where it shows up

- **`npm run dev`** — applied on route mount and on every re-render, so you can watch it follow your state in devtools while you work.
- **`npm run build` with prerendering** — the merged head is written into each route's `index.html`, so crawlers and link unfurlers read it straight from the file, with no JavaScript. See [Prerendering & SEO](/docs/prerendering).
- **`npm run build` without prerendering** — still applied at runtime, so a browser (and any crawler that executes JavaScript) sees it. A file-only reader sees the `public/index.html` head.
