---
title: Limitations
group: Advanced
order: 220
---

OlumJS is deliberately small, and a few rough edges come with that. Here's what to watch for today — each has a straightforward workaround by design.

## 1. Re-renders rebuild the whole stateful component

When a component has `state` and it changes, Olum rebuilds that **entire target component — including its inner child components**. Any live DOM state that Olum doesn't track is lost in the rebuild: a playing `<video>` restarts, a running animation resets, and focused/typed-in `form` inputs lose their value and focus.

**Avoid it by design:** keep the reactive `state` **outside** the component that holds the video / animation / form inputs. If that media component stays stateless, it never re-renders and its DOM state is preserved.

```html title="lift-state.html"
<!-- ✗ State lives INSIDE the media/input component.
     Any re-render rebuilds it, so the <video> restarts,
     the animation resets, and typed-in inputs lose value/focus. -->
<!-- MediaBox.html -->
<script>
  const state = { count: 0 };          // mutating this re-renders MediaBox
  const inc = () => state.count++;
</script>
<video src="/clip.mp4" controls></video>
<button onclick="inc()">{state.count}</button>

<!-- ✓ Lift the state OUT to a parent, keep the media/input
     component stateless so it never re-renders. -->
<!-- Parent.html -->
<script>
  const state = { count: 0 };          // re-renders the counter, not the video
  const inc = () => state.count++;
</script>
<MediaBox />                           <!-- stateless → the <video> is safe -->
<button onclick="inc()">{state.count}</button>
```

## 2. No integrated unit testing

There is no testing framework wired into OlumJS yet — no built-in test runner or component testing utilities. You can still test plain JS logic with any external tool, but there's no first-class story for testing components at the moment.

## 3. Global store ergonomics

There is already a **global store across the whole application**, together with the [scope system](/docs/scope) (private/public attributes on the `<script>` tag) for exposing props/methods. It's a little awkward in practice, though: a registered component's name isn't straightforward, so you reach it through its location key — e.g. `olum.app.store["page>App#0"]`.

**For now:** use a single dedicated component for your store, put your props/methods in it, and access it by its location key.

```html title="store.html"
<!-- A dedicated store component that exposes its props/methods -->
<!-- App.html (mounted at src/page.html) -->
<script public>
  const user = { name: "Ann" };
  const login = () => { /* … */ };
</script>

// Access it elsewhere by its registered location key:
olum.app.store["page>App#0"].user;
olum.app.store["page>App#0"].login();
```
