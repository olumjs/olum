---
title: よくある間違い
group: 応用
order: 280
source: 81301d5481bf
---

Olum では、何をするにも**やり方は 1 つ**で、値は常に**引用符の中**に書きます。他のフレームワークから来た人がよく間違えて書くものをまとめました。

## テンプレート構文 {#template-syntax}

| ✗ こう書かない | ✓ 代わりにこう書く | 理由 |
|---------------|-----------------|-----|
| `when={x}` / `each={x}` | `when="x"` / `each="x"` | 値は `""` に入れる |
| `value={state.x}` | `value="{state.x}"` | テキスト属性 + `{}` |
| `:title="x"` | `title="{x}"` | `:` バインディングはない |
| `:style="{…}"` | `style="color:{x}; …"` | style はテキスト + `{}` |
| `<img {src} />` | `<img src="{src}" />` | 省略記法はない |
| `oninput={(e)=>…}` | `oninput="(e)=>…"` | イベントは `""` に入れる |
| `mode="prevent"` | ハンドラ内で `e.preventDefault()` | イベント修飾子はない |
| `model="state.x"` | `value="{state.x}"` + `oninput` | [手動でバインドする](/docs/two-way-binding) |
| テキスト中の `{` そのもの | `{String.fromCharCode(123)}` | `{…}` はすべてコード |
| `each="i of state.n"` | `each="i of Array.from({length: state.n}, (_, k) => k + 1)"` | カウントは数字で直接書く |
| `url(assets/x.svg)` / `src="assets/…"` | `url(/assets/x.svg)` | ファイルの URL は [`/` で始める](/docs/static-assets) |
| 1 つの要素に `oninput="…" onblur="…"` | そのままで OK | 1 つの要素に複数の `on*` を書ける |

## コンポーネントと props {#components-and-props}

| ✗ こう書かない | ✓ 代わりにこう書く | 理由 |
|---------------|-----------------|-----|
| `<comp/>` | `<Comp/>` | コンポーネントは PascalCase |
| `<Comp {a} />` / `<Comp a={a} />` | `<Comp a="{a}" />` | 省略記法はなく、値は `""` に入れる |
| `<Comp {...obj} />` | `<Comp a="{obj.a}" b="{obj.b}" />` | スプレッドはないので、フィールドごとに渡す |
| `<Comp onX="(e)=>…" />` | `<Comp onX="{handler}" />` | コンポーネントでは `on*` は prop であり、アロー関数はテキストとして渡る |
| `<Comp onX="{(e)=>…}" />` / `<Comp onX="{obj.fn}" />` | 関数に名前を付けて、その名前を渡す | [関数の prop](/docs/components#function-props) は名前でなければならず、そうでないと `undefined` として渡る |
| `const { color } = props(); color = "x"` | `const { onChange } = props(); onChange("x")` | props は読み取り専用（代入するとエラー） |
| `const { a, ...rest } = props()` | 残りは `props()` で読む | `rest` は[更新されない](/docs/components#what-is-only-read-once) |
| `const { user: { name } } = props()` | `const { user } = props()` としてから `user.name` | ネストしたパターンは更新されない |
| `const { [key]: v } = props()` | `props()[key]` | 計算されたキーは更新されない |
| `const p = props(); const { a } = p` | `const { a } = props()` | `props()` を直接分割代入する |
| `onMount(() => { const { a } = props(); … })` | `<script>` の先頭で分割代入する | 関数の中では 1 回しか読まれない |
| `const { a, b = a } = props()` | `b` には独自のデフォルト値を付ける | 別の prop を使ったデフォルト値は古い値になる |

## ステート {#state}

| ✗ こう書かない | ✓ 代わりにこう書く | 理由 |
|---------------|-----------------|-----|
| `state.user.name = "Bo"` | そのままで OK | リアクティビティは[深い](/docs/state) |
| `state.todos.push(t)` | そのままで OK | その場での変更も効き、1 回の更新にまとめられる |

## フォームとイベント {#forms-and-events}

| ✗ こう書かない | ✓ 代わりにこう書く | 理由 |
|---------------|-----------------|-----|
| `<select value="{x}">` | 各 `<option>` に `selected="{x === …}"` | `<select>` の `value` は何もしない |
| `<textarea>{state.text}</textarea>` | `<textarea value="{state.text}">` | textarea は `value` でバインドする |
| 数値の入力欄で `state.n = e.target.value` | `state.n = +e.target.value` | `e.target.value` は常にテキスト |
| 日付の入力欄で `new Date(state.date)` | `new Date(state.date + "T00:00:00")` | 日付の入力欄はテキストを返し、`Date` ではない |
| `state.files.map(…)` | `Array.from(state.files).map(…)` | 配列ではなく `FileList` |
| ステートに保存しない `contenteditable` | `textContent` / `innerHTML` をステートにコピーする | ステートにないものは次の更新で消える |
| ラッパーに `onfocus` / `onblur` | 入力欄自体に付ける | focus と blur はバブリングしない |
| `preventDefault()` のない `ondragover` | `ondragover="(e)=> e.preventDefault()"` | そうしないとドロップが拒否される |
| 属性としての `oncopy` / `onpaste` / `onfocusin` | `onMount` で追加し、そのクリーンアップで削除する | [属性としてはサポートされていない](/docs/events#events-you-must-add-by-hand) |

## ライフサイクル、ref、ルーティング {#lifecycle-refs-and-routing}

| ✗ こう書かない | ✓ 代わりにこう書く | 理由 |
|---------------|-----------------|-----|
| `bind:this` / 要素の ref | `host.querySelector(…)` | ref はないので [`host`](/docs/lifecycle#host) を使う |
| `use:action` | `onMount` でセットアップし、その戻り値でクリーンアップ | アクションはない（[制限事項](/docs/limitations)） |
| `onMount(…)` を 2 回呼ぶ | 1 回の呼び出しと、まとめた 1 つのクリーンアップ | 使われるのは最初の 1 回だけ |
| URL にフィルターを保存するための `push("/shop?tab=" + tab)` | `setSearchParam("tab", tab)` | `push()` はページを再レンダリングしてステートをリセットする（[詳細](/docs/router/programmatic-navigation#updating-the-query-without-rendering)） |
