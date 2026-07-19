---
title: Active Link Styling
group: Routing
order: 215
---

When the current URL matches a link's `to` path, the router automatically adds an `active` class to that anchor. Use it to style the current route — no extra wiring needed.

````html title="src/nav.html"
<!-- The router adds `active` to whichever anchor matches the current URL. -->
<a to="/">Home</a>
<a to="/about">About</a>
````

Target the class in your styles to highlight the active link:

````css title="src/nav.css"
a.active {
  font-weight: bold;
  color: #6366f1;
}
````

:::tip
This only applies to anchors the router controls with the `to` attribute — see [Navigating with to](/docs/navigating-with-to).
:::
