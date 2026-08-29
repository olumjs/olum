---
title: Component File Structure
group: Getting Started
order: 20
---

A component is one `.html` file with up to three parts: `<script>` (logic), `<style>` (scoped CSS), and the template (everything else). A **page** component may add a fourth: `<head>` (metadata).

```html title="Counter.html"
<!-- Counter.html -->
<script>
  const state = { count: 0 };
  const inc = () => state.count++;
</script>

<style>
  .counter { font-weight: 700; }
</style>

<div class="counter">
  Count: {state.count}
  <button onclick="inc()">+</button>
</div>
```

- `state`, methods, and any consts destructured from [`props()`](/docs/components) are directly available in the template (same closure).
- `<style>` is automatically **scoped** to the component (the compiler tags the component's elements with a unique attribute).
- Component **tag names are PascalCase** — that's how the compiler tells a component apart from a normal element.

## Details worth knowing

- **The filename is the component name.** `CounterCard.html` compiles to the `CounterCard` component — name the file in PascalCase to match the tag.
- **Every instance renders inside a wrapper `<div>`** created by the runtime — that wrapper is the `host` element you get in [`onMount`](/docs/lifecycle). Keep it in mind when writing CSS around a component tag (e.g. direct-child selectors in the parent).
- **`<script>` and `<style>` are both optional.** A file with only markup is a perfectly valid static component.
- **`<head>` is for page files only.** A route component (`page.html` / `not-found.html`) can declare the document's title, description, Open Graph tags and JSON-LD in a `<head>` block, compiled against the same closure as the template. In any other component it is ignored with a build warning. See [Page Metadata & SEO](/docs/metadata).

```html title="src/blog/[slug]/page.html"
<head>
  <title>{post.title} — My Blog</title>
  <meta name="description" content="{post.excerpt}" />
</head>

<script>
  import { params } from "olum";
  const { slug } = params();
  const post = getPost(slug);
</script>

<article><h1>{post.title}</h1></article>
```
