---
title: Common Mistakes
group: Advanced
order: 280
---

Olum has **one way** to do each thing, and values always go **inside quotes**. Here's what people coming from other frameworks often write by mistake.

## Template syntax

| ✗ Don't write | ✓ Write instead | Why |
|---------------|-----------------|-----|
| `when={x}` / `each={x}` | `when="x"` / `each="x"` | values go in `""` |
| `value={state.x}` | `value="{state.x}"` | text attribute + `{}` |
| `:title="x"` | `title="{x}"` | no `:` bindings |
| `:style="{…}"` | `style="color:{x}; …"` | style is text + `{}` |
| `<img {src} />` | `<img src="{src}" />` | no shorthand |
| `oninput={(e)=>…}` | `oninput="(e)=>…"` | events go in `""` |
| `mode="prevent"` | `e.preventDefault()` in the handler | no event modifiers |
| `model="state.x"` | `value="{state.x}"` + `oninput` | [bind by hand](/docs/two-way-binding) |
| a literal `{` in text | `{String.fromCharCode(123)}` | any `{…}` is code |
| `each="i of state.n"` | `each="i of Array.from({length: state.n}, (_, k) => k + 1)"` | the count must be a written number |
| `url(assets/x.svg)` / `src="assets/…"` | `url(/assets/x.svg)` | file URLs [start with `/`](/docs/static-assets) |
| `oninput="…" onblur="…"` on one element | fine as is | several `on*` per element work |

## Components and props

| ✗ Don't write | ✓ Write instead | Why |
|---------------|-----------------|-----|
| `<comp/>` | `<Comp/>` | components are PascalCase |
| `<Comp {a} />` / `<Comp a={a} />` | `<Comp a="{a}" />` | no shorthand, values in `""` |
| `<Comp {...obj} />` | `<Comp a="{obj.a}" b="{obj.b}" />` | no spread, pass each field |
| `<Comp onX="(e)=>…" />` | `<Comp onX="{handler}" />` | on a component, `on*` is a prop; the arrow arrives as text |
| `<Comp onX="{(e)=>…}" />` / `<Comp onX="{obj.fn}" />` | name the function, pass the name | [function props](/docs/components#function-props) must be a name, or they arrive `undefined` |
| `const { color } = props(); color = "x"` | `const { onChange } = props(); onChange("x")` | props are read-only (assigning throws) |
| `const { a, ...rest } = props()` | use `props()` for the extras | `rest` is [never updated](/docs/components#what-is-only-read-once) |
| `const { user: { name } } = props()` | `const { user } = props()`, then `user.name` | nested patterns aren't updated |
| `const { [key]: v } = props()` | `props()[key]` | computed keys aren't updated |
| `const p = props(); const { a } = p` | `const { a } = props()` | destructure `props()` directly |
| `onMount(() => { const { a } = props(); … })` | destructure at the top of `<script>` | inside a function it's read once |
| `const { a, b = a } = props()` | give `b` its own default | a default using another prop gets an old value |

## State

| ✗ Don't write | ✓ Write instead | Why |
|---------------|-----------------|-----|
| `state.user.name = "Bo"` | fine as is | reactivity is [deep](/docs/state) |
| `state.todos.push(t)` | fine as is | in-place changes work, and are grouped into one update |

## Forms and events

| ✗ Don't write | ✓ Write instead | Why |
|---------------|-----------------|-----|
| `<select value="{x}">` | `selected="{x === …}"` on each `<option>` | `value` on `<select>` does nothing |
| `<textarea>{state.text}</textarea>` | `<textarea value="{state.text}">` | a textarea binds with `value` |
| `state.n = e.target.value` on a number field | `state.n = +e.target.value` | `e.target.value` is always text |
| `new Date(state.date)` on a date input | `new Date(state.date + "T00:00:00")` | date inputs give text, not a `Date` |
| `state.files.map(…)` | `Array.from(state.files).map(…)` | it's a `FileList`, not an array |
| a `contenteditable` not saved to state | copy `textContent` / `innerHTML` into state | the next update wipes what isn't in state |
| `onfocus` / `onblur` on a wrapper | put them on the field | focus and blur don't bubble |
| `ondragover` without `preventDefault()` | `ondragover="(e)=> e.preventDefault()"` | otherwise the drop is refused |
| `oncopy` / `onpaste` / `onfocusin` as attributes | add them in `onMount`, remove in its cleanup | [not supported as attributes](/docs/events#events-you-must-add-by-hand) |

## Lifecycle, refs and routing

| ✗ Don't write | ✓ Write instead | Why |
|---------------|-----------------|-----|
| `bind:this` / element refs | `host.querySelector(…)` | no refs, use [`host`](/docs/lifecycle#host) |
| `use:action` | set it up in `onMount`, clean up in its return | no actions ([limitations](/docs/limitations)) |
| two `onMount(…)` calls | one call, one combined cleanup | only the first is used |
| `push("/shop?tab=" + tab)` to save a filter in the URL | `setSearchParam("tab", tab)` | `push()` renders the page again and resets its state ([details](/docs/router/programmatic-navigation#updating-the-query-without-rendering)) |
