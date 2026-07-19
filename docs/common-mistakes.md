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
| `<Comp {...obj} />` | `<Comp a="{obj.a}" b="{obj.b}" />` | no spread props — pass each field |
| `<select value="{x}">` | `selected="{x === …}"` on each `<option>` | `value` on `<select>` silently does nothing |
| `bind:this` / element refs | `host.querySelector(…)` in `onMount` | no refs — query within [`host`](/docs/lifecycle) |
| `use:action` | wire up manually in `onMount`, clean up in its return | no action directive ([limitations](/docs/limitations)) |
| `state.user.name = "Bo"` | works as-is | reactivity is [deep](/docs/state) |
| `state.todos.push(t)` | works as-is | deep reactivity; for **large** arrays prefer reassignment or the global store ([why](/docs/limitations)) |
| `const { a, ...rest } = props()` | `props()` for the extras | `rest` is a one-time snapshot — only plain names stay [live](/docs/components) |
| `const { user: { name } } = props()` | `const { user } = props()` then `user.name` | nested patterns aren't made live |
| `const { [key]: v } = props()` | `props()[key]` | computed keys aren't made live |
| `const p = props(); const { a } = p` | `const { a } = props()` | liveness needs a direct `props()` destructure |
| `onMount(() => { const { a } = props(); … })` | destructure at the top level of `<script>` | inner destructures are scoped snapshots |
| `const { a, b = a } = props()` | give `b` a self-contained default | a default referencing another destructured prop reads its stale value |
| `const { color } = props(); color = "x"` | `const { onChange } = props(); onChange("x")` | props are read-only — assigning throws (const); change values through a callback prop |
| `url(assets/x.svg)` / `src="assets/…"` | `url(/assets/x.svg)` — leading `/` | asset URLs are root-absolute ([why](/docs/static-assets)) |
| `oninput="…" onblur="…"` on one element | one handler, extras via `onMount` | one `on*` attribute per element ([events](/docs/events)) |
| `each="i of state.n"` | `each="i of Array.from({length: state.n}, (_, k) => k + 1)"` | numeric range needs a literal number |
| two `onMount(…)` calls | one call, one combined cleanup | only the first call is wired |
| `params()` called twice | destructure once at top level | only the first call is compiled |
