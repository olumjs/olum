---
title: Page Metadata & SEO
group: Build & SEO
order: 230
---

A page can set its own `<head>` (title, description, social cards, canonical link, JSON-LD) right inside its `page.html`:

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

`{expr}` in the `<head>` can use anything from `<script>` (`state`, `params()`, `props()`, your consts), just like the template.

## Only pages can have a `<head>`

| File | `<head>` allowed? |
|------|-------------------|
| `page.html` | ✅ yes |
| `not-found.html` | ✅ yes |
| any other component | ❌ ignored, with a build warning telling you where to move it |

:::warn
- Close the tag: `<head> … </head>`. An unclosed `<head>` is ignored (with a warning).
- Only the **first** `<head>` in a file is used.
:::

## How it combines with `public/index.html`

`public/index.html` is the starting point. Your page's tags are merged into it:

- If your page has a tag of the **same kind**, it **replaces** the original one, in the same spot.
- If not, your tag is **added** at the end.
- Everything else stays as it was, including Olum's `<style>` tags and the bundler's `<script>` / `<link>` tags.

What counts as "the same kind":

| Tag | Same kind when it has the same… |
|-----|------------------------|
| `<title>`, `<base>` | (only one per page) |
| `<meta charset>` | `charset` |
| `<meta name>`, `<meta property>`, `<meta http-equiv>`, `<meta itemprop>` | name / property |
| `<link rel="canonical" \| "icon" \| "apple-touch-icon" \| "manifest" \| "amphtml">` | `rel` (only one per page) |
| `<link rel="stylesheet" \| "preload" \| "preconnect" \| …>` | `rel` **and** `href`, so a page **adds** a stylesheet instead of replacing yours |
| `<script type="application/ld+json">` | one per page (give each an `id` if you need several) |

**Example.** The shell has a `<title>`, `charset`, `description`, `viewport` and a stylesheet. The page declares a `<title>`, a `description` and `og:title`. Result: the title and description are **replaced**, `og:title` is **added**, and `charset`, `viewport` and the stylesheet are **untouched**.

`not-found.html` works the same way, so your 404 page can set its own `<title>` and `robots`.

:::tip
Put site-wide tags (`charset`, `viewport`, favicon, stylesheet, `theme-color`) in `public/index.html`. Put only page-specific tags in a page's `<head>`.
:::

### Changing pages is always clean

Every time a route loads, Olum **resets the head to `public/index.html` first**, then applies the new page's tags. So an `og:image` from the last page never leaks into the next one. A page without a `<head>` gets exactly the original head.

:::note
Replaced tags are kept in a hidden `<template data-olum-head>` (this is how a [prerendered](/docs/prerendering) page can restore them), and tags added by a page get a `data-olum-head` attribute. Both are harmless; ignore them.
:::

## Structured data (JSON-LD)

Inside `<script type="application/ld+json">`, a plain `{` is normal JSON. `{expr}` only works **inside a double-quoted string**, and the value is inserted **raw** (not HTML-escaped) so the JSON stays valid:

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
Because the value is raw, a `"` or `\` in it breaks the JSON. For user-supplied text, use `{JSON.stringify(match.name)}` **without** the quotes around it.
:::

## Escaping everywhere else

Outside JSON-LD, `{expr}` is **HTML-escaped**, like in the template, so a quote in a description can't break the tag.

| You write | You get |
|-----------|---------|
| `` ` `` | a backtick (escaped for you) |
| `\` | a backslash (escaped for you) |
| `${x}` | `$` followed by the value of `{x}` (the `$` is just text) |

## It updates with your state

The head re-renders with the page, in dev **and** production:

```html title="src/blog/[slug]/page.html"
<head>
  <title>{state.post.title} — My Blog</title>
</head>

<script>
  import { onMount } from "olum";
  const state = { post: { title: "Loading…" } };

  onMount(async () => {
    state.post = await fetchPost();   // the tab title updates
  });
</script>
```

Only the **page** controls the head. Child components never touch it, and the head is only re-applied when its output actually changed.

:::warn
Social previews (Twitter, Slack, Facebook, LinkedIn) don't run JavaScript; they only read the HTML file. For them to see your tags, the page must be [prerendered](/docs/prerendering). If the title comes from an `await`, the build must also wait for it: that is what `SSG_DELAY` is for.
:::

## Where it applies

- **`npm run dev`**: applied when a route loads and on every re-render.
- **`npm run build` with prerendering**: written into each route's `index.html`, so crawlers read it without JavaScript.
- **`npm run build` without prerendering**: applied in the browser only. Tools that don't run JavaScript see the `public/index.html` head.
