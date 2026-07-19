---
title: History Mode & the 404 Page
group: Routing
order: 220
---

- The router uses **history mode by default** (clean URLs like `/blog/hello`). If the browser lacks the History API it **falls back to hash mode** (`/#/blog/hello`).
- History mode needs the server to serve `index.html` for unknown paths — see [Build & Deploy](/docs/build-and-deploy) for host configuration.
- Add a `not-found.html` at the **root of your project's `src/` directory** and it becomes the default 404 page, rendered whenever no route matches. Without it, an unmatched URL renders a plain "Page Not Found!" text in the app root.

## Dynamic segments

Multiple dynamic segments in one path work — `/users/[id]/posts/[postId]/page.html` matches `/users/5/posts/10`, and [`params()`](/docs/reading-route-params) returns both values. When a URL could match both a static and a dynamic route, the **static route wins**.

:::warn
**No catch-all segments.** A `[...slug]` folder is not supported — each `[param]` matches exactly **one** URL segment, and a route only matches when the segment counts line up.
:::
