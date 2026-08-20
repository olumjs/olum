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
| `<Comp onX="(e)=>…" />` | `<Comp onX="{handler}" />` | on a component `on*` is a prop, not DOM code — the arrow arrives as a plain string |
| `<Comp onX="{(e)=>…}" />` / `<Comp onX="{obj.fn}" />` | name the function, pass the name | [function props](/docs/components) travel by name — anything else arrives `undefined` |
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
| `<textarea>{state.text}</textarea>` | `<textarea value="{state.text}">` | a textarea binds through `value` ([forms](/docs/forms)) |
| `state.n = e.target.value` on a number field | `state.n = +e.target.value` | `e.target.value` is always a string |
| `new Date(state.date)` on a date input | `new Date(state.date + "T00:00:00")` | date/time inputs give a plain string, never a `Date` |
| `state.files.map(…)` | `Array.from(state.files).map(…)` | a file input gives a `FileList`, not an array |
| `oncopy` / `onpaste` / `onfocusin` inline | wire them in `onMount`, clean up in its return | not in the [known `on*` list](/docs/events) |
| `onfocus` / `onblur` on a wrapper | put them on the field itself | focus and blur don't bubble |
| `ondragover` with no `preventDefault()` | `ondragover="(e)=> e.preventDefault()"` | without it the browser refuses the drop |
| a `contenteditable` left out of state | mirror `textContent` / `innerHTML` back into state | the next re-render wipes what isn't in state |
| `use:action` | wire up manually in `onMount`, clean up in its return | no action directive ([limitations](/docs/limitations)) |
| `state.user.name = "Bo"` | works as-is | reactivity is [deep](/docs/state) |
| `state.todos.push(t)` | works as-is | deep reactivity — in-place mutations re-render, batched into one pass ([state](/docs/state)) |
| `const { a, ...rest } = props()` | `props()` for the extras | `rest` is a one-time snapshot — only plain names stay [live](/docs/components) |
| `const { user: { name } } = props()` | `const { user } = props()` then `user.name` | nested patterns aren't made live |
| `const { [key]: v } = props()` | `props()[key]` | computed keys aren't made live |
| `const p = props(); const { a } = p` | `const { a } = props()` | liveness needs a direct `props()` destructure |
| `onMount(() => { const { a } = props(); … })` | destructure at the top level of `<script>` | inner destructures are scoped snapshots |
| `const { a, b = a } = props()` | give `b` a self-contained default | a default referencing another destructured prop reads its stale value |
| `const { color } = props(); color = "x"` | `const { onChange } = props(); onChange("x")` | props are read-only — assigning throws (const); change values through a callback prop |
| `url(assets/x.svg)` / `src="assets/…"` | `url(/assets/x.svg)` — leading `/` | asset URLs are root-absolute ([why](/docs/static-assets)) |
| `oninput="…" onblur="…"` on one element | works as-is | several `on*` attributes per element are fine ([events](/docs/events)) |
| `each="i of state.n"` | `each="i of Array.from({length: state.n}, (_, k) => k + 1)"` | numeric range needs a literal number |
| two `onMount(…)` calls | one call, one combined cleanup | only the first call is wired |
| `params()` called twice | destructure once at top level | only the first call is compiled |
