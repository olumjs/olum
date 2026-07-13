---
title: Common Mistakes
group: Advanced
order: 210
---

OlumJS intentionally has **no naked braces** and **one way** to do each thing. These do **not** work:

| ✗ Don't write | ✓ Write instead | Why |
|---------------|-----------------|-----|
| `when={x} / each={x}` | `when="x" / each="x"` | values live in `""` |
| `value={state.x}` | `value="{state.x}"` | string attr + `{}` |
| `oninput={(e)=>…}` | `oninput="(e)=>…"` | events in `""` |
| `<Comp {a} />` | `<Comp a="{a}" />` | no shorthand |
| `<Comp a={a} />` | `<Comp a="{a}" />` | no naked-brace prop |
| `<img {src} />` | `<img src="{src}" />` | no shorthand |
| `:style="{…}"` | `style="color:{x}; …"` | string style + `{}` |
| `:title="x"` | `title="{x}"` | string attr + `{}` |
| `model="state.x"` | `value="{state.x}"` + oninput | bind manually |
| `mode="prevent"` | e.preventDefault() in the handler | no modifiers |
| literal `{` in text | `{String.fromCharCode(123)}` | any `{…}` is interpolated |
| `<comp/>` | `<Comp/>` | components are PascalCase |
| `state.user.name = "Bo"` | `state.user = { ...state.user, name: "Bo" }` | reactivity is [one level deep](/docs/state) |
| `state.todos.push(t)` | `state.todos = [...state.todos, t]` | in-place mutation isn't tracked |
