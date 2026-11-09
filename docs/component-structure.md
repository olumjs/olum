---
title: Component File Structure
group: Getting Started
order: 10
---

A component is one `.html` file. It can have three parts:

- `<script>`: your JavaScript (data and functions)
- `<style>`: your CSS (it only affects this component)
- everything else: the HTML template

```html title="Counter.html"
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

The template can use everything declared in `<script>`: `state`, your functions, and names you take from [`props()`](/docs/components).

## Good to know

- **The file name is the component name.** `CounterCard.html` becomes the `CounterCard` component. Use PascalCase (each word starts with a capital letter).
- **Component tags are PascalCase too**: `<CounterCard />`. That capital letter is how Olum tells your components apart from normal HTML tags like `<div>`.
- **`<script>` and `<style>` are optional.** A file with only HTML is a valid component.
- **`<style>` is scoped** automatically. See [Scoped CSS](/docs/scoped-css).
- **Each component is wrapped in a `<div>`** that Olum adds. That `<div>` is the [`host`](/docs/lifecycle) element. Keep it in mind when you write CSS like `.parent > .child` around a component.
- **Page files can also have a `<head>`.** Only route files (`page.html` and `not-found.html`) may set the page title, description and other meta tags. In any other component, `<head>` is ignored and the build prints a warning. See [Page Metadata & SEO](/docs/metadata).

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
