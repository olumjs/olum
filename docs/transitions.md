---
title: Transitions
group: Template Syntax
order: 140
---

Animate an element as it enters or leaves. Wrap it in a `<transition>` tag — a
compiler-known wrapper (like `<if>`/`<show>`/`<for>`) that stamps its single element
child and plays the animation. The intro runs when the element enters (an `<if>` adds
it); the element's removal is **deferred** so the outro can play before it's gone.

```html title="Component.html"
<if when="state.visible">
  <transition transition="fade">
    <p>Fades in and out</p>
  </transition>
</if>
```

## Attributes

- `transition="fn(params)"` — same animation for enter **and** leave.
- `in="fn(params)"` — only when entering.
- `out="fn(params)"` — only when leaving.

`params` is a normal object evaluated at render time (so it can read `state` or a
`<for>` loop variable):

```html
<transition in="fly({ y: 200, duration: 2000 })" out="fade">…</transition>
```

`<transition>` wraps **one element** — that element is what animates (there's no extra
wrapper node in the output). If it's dropped and re-added before its outro finishes, the
outro is cancelled and it eases back in.

## Built-in transitions

Available by name, no import:

| Name | Params (all optional) |
|---|---|
| `fade` | `delay`, `duration` |
| `fly` | `delay`, `duration`, `x`, `y`, `opacity` |
| `scale` | `delay`, `duration`, `start`, `opacity` |
| `slide` | `delay`, `duration` (animates height + vertical padding/margin) |
| `draw` | `delay`, `duration` \| `speed` (traces an SVG path via `stroke-dashoffset`) |

Every built-in also takes `easing` — the **name** of an easing (params are serialized, so
pass a string, not a function). The full set lives on `olum.easings`: `linear` plus
`sine`/`quad`/`cubic`/`quart`/`quint`/`expo`/`circ`/`back`/`elastic`/`bounce`, each with an
`In`, `Out`, and `InOut` variant (e.g. `quintOut`, `bounceInOut`, `backIn`).

```html
<transition in="fly({ y: 40, easing: 'bounceOut' })"><p>…</p></transition>
```

## Custom transitions

Any function `(node, params) => { delay?, duration?, easing?, css?(t, u), tick?(t, u) }`
works — the same contract Svelte uses. Define it in `<script>` (a local function of the
same name wins over a built-in) and name it:

```html title="Component.html"
<script>
  const spin = (node, { duration } = {}) => ({
    duration,
    css: (t) => `transform: scale(${t}) rotate(${t * 1080}deg)`,
  });
</script>

<transition in="spin({ duration: 800 })" out="fade"><div>…</div></transition>
```

Return `css(t, u)` for a CSS animation (applied as inline style each frame) or `tick(t, u)`
for a JS one (e.g. a typewriter that rewrites `textContent`). `t` goes 0→1 on enter and
1→0 on leave; `u` is `1 - t`.

> Params are JSON-serialized, so you can't pass a **function** (like a custom easing) as a
> param — bake it into the transition function instead.

## Lifecycle events

Bare method names, fired at the edges of the animation:

```html
<transition transition="fly({ y: 200 })"
  onintrostart="introStart" onintroend="introEnd"
  onoutrostart="outroStart" onoutroend="outroEnd">
  <p>…</p>
</transition>
```

## Keyed lists

`<transition>` also works on items inside a **keyed** `<for>` — as items are added or
removed, each plays its `in`/`out`. Keying (`key="..."`) is what lets olum tell which item
left vs. which stayed, so the transitions land on the right elements:

```html
<for each="todo of state.todos" key="todo.id">
  <transition in="fly({ y: 20 })" out="fade">
    <li>{todo.text}</li>
  </transition>
</for>
```

## `flip` — animate items to their new position

Add a `flip` attribute and, when a keyed reorder moves an item, olum measures where it was
and where it lands and slides it there (the "FLIP" technique). It composes with `in`/`out` on
the same wrapper. **`flip` needs a keyed `<for>`** — that's how items keep their identity
across the reorder.

```html
<for each="todo of state.todos" key="todo.id">
  <transition flip="{ duration: 300, easing: 'quintOut' }">
    <li>{todo.text}</li>
  </transition>
</for>
```

`flip` takes `duration`, `delay`, and `easing` (a name string). Bare `<transition flip>` uses
the defaults.

## `crossfade` — fly between two places

`crossfade()` returns a `[send, receive]` pair. Put `out="send({ key })"` on an element
leaving one spot and `in="receive({ key })"` on the element entering another with the **same
key**, and the two animate as one element flying between the positions. When a key has no
partner (an item that just disappears), the `fallback` transition plays instead.

Define the pair in `<script>`. Because `crossfade` is destructured, wrap the two functions as
named consts so they're callable from the template:

```html title="Component.html"
<script>
  import { crossfade, transitions } from "olum";

  const _cf = crossfade({ duration: 300, fallback: transitions.scale });
  const send = (node, params) => _cf[0](node, params);
  const receive = (node, params) => _cf[1](node, params);

  const state = { todos: [/* … */] };
  const done = () => state.todos.filter((t) => t.done);
  const active = () => state.todos.filter((t) => !t.done);
</script>

<for each="todo of active()" key="todo.id">
  <transition in="receive({ key: todo.id })" out="send({ key: todo.id })" flip>
    <li>{todo.text}</li>
  </transition>
</for>
<!-- a matching list of done() items with the same in/out/flip -->
```

`crossfade({ duration?, easing?, fallback? })` — `easing` is a name string; `fallback` is any
transition function (e.g. a built-in from the `transitions` import, or your own).

> **Key off a primitive, not an object.** State is deeply reactive, so `state.selected !== someItem`
> (object identity) won't behave as you expect — compare an **id** (`state.selectedId !== item.id`)
> and use that id as the crossfade `key`.

## Notes

- Transitions animate with `requestAnimationFrame`, so they **pause in a background tab** and
  resume when it's visible again — normal browser behavior.
- Enter/leave for a single element toggled by `<if>`/`<show>` (v1), plus keyed-list
  enter/leave, `flip`, and `crossfade` (v2), are all supported.
