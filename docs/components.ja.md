---
title: コンポーネントと Props
group: コンポーネント
order: 160
source: 7b9978640bfb
---

`<script>` でコンポーネントをインポートし、**PascalCase** のタグとして使います。渡した属性がそのコンポーネントの **props** になります：

```html title="Parent.html"
<script>
  import StatusBadge from "./StatusBadge";
  import CounterCard from "./CounterCard";
  const state = { score: 5, name: "Ann" };
</script>

<StatusBadge label="Online" color="#16a34a" />
<CounterCard title="Counter" initialValue="{state.score}" />
```

## props を渡す {#passing-props}

```html title="Parent.html"
<Comp
  title="Hello"               <!-- "Hello"   → text                         -->
  count="{n + 1}"             <!-- 6         → a real number                -->
  data="{state.user}"         <!-- {...}     → the real object              -->
  greet="Hi {state.name}"     <!-- "Hi Ann"  → text with a value inside     -->
/>
```

- 普通の値 → **テキスト**。
- `{expr}` だけで他に何もない → **本物の値**（数値、オブジェクト、配列、関数…）。
- テキストと `{expr}` が混ざっている → **テキスト**。

:::note
スプレッドの省略記法（`<Comp {...obj} />`）はありません。フィールドごとに渡してください：`<Info name="{pkg.name}" version="{pkg.version}" />`。
:::

prop の名前は camelCase の単純な名前（英字、数字、`_`）でなければなりません。`data-x="1"` のようなダッシュを含む名前はコンポーネントでは動きません（ダッシュで名前が切れてしまいます）。ダッシュを含む属性は通常の HTML タグにだけ使ってください。

## 子で props を読む {#reading-props-in-the-child}

`olum` から `props` をインポートし、`<script>` の**先頭**で必要なものを取り出します：

```html title="StatusBadge.html"
<script>
  import { props } from "olum";
  const { label, color } = props();
</script>

<span class="badge" style="color:{color}">{label}</span>
```

これらの名前は**常に最新の値**を持ちます。親が新しい値を渡すと、`label` と `color` はテンプレートでも、関数の中でも、イベントハンドラの中でも、あらゆる場所で更新されます。（Olum が使用箇所ごとに `props().label` を新たに読み取る形に変換してくれます。自分で `props().label` と書いても動きます。）

### デフォルト値 {#default-values}

親が prop を渡さなかった場合に備えて、普通の JavaScript のデフォルト値を使います：

```html title="Nested.html"
<script>
  import { props } from "olum";
  const { answer = "a mystery" } = props();
</script>
<p>The answer is {answer}</p>
```

```html title="Parent.html"
<Nested answer="{42}" />   <!-- The answer is 42 -->
<Nested />                 <!-- The answer is a mystery -->
```

### 最新の値に保たれるもの {#what-stays-up-to-date}

```js
const { color } = props();               // ✓ up to date everywhere
const { color: c } = props();            // ✓ renamed: c is the parent's `color`
const { size = "md" } = props();         // ✓ with a default
const { theme: t = "dark" } = props();   // ✓ renamed + default
const { children } = props();            // ✓ slot content (see Slots)
const { onChange } = props();            // ✓ a function prop
```

同じ名前のループ変数や関数の引数は、普通の JavaScript と同じく、そのブロックの中で prop を隠します。

### 1 回しか読まれないもの {#what-is-only-read-once}

次のパターンは、コンポーネントが作られたときの値を保持します。エラーにはなりませんが、更新されません：

```js
const { a, ...rest } = props();          // ✗ rest is not updated (a still is)
const { user: { name } } = props();      // ✗ nested: use const { user } = props(), then user.name
const { [key]: v } = props();            // ✗ computed key: use props()[key]
onMount(() => {
  const { a } = props();                 // ✗ not at the top of <script>
});
const p = props();
const { a } = p;                         // ✗ indirect: destructure props() directly
const { a, b = a } = props();            // ✗ a default that uses another prop gets an old value
```

## 関数の props {#function-props}

prop は**関数**にもできます。子が親に何かが起きたことを伝えるのはこの方法です。親が関数を渡し、子がそれを呼びます。

```html title="Parent.html"
<script>
  import Inner from "./Inner";
  const handleMessage = (payload) => alert(payload.text);
</script>

<Inner onMessage="{handleMessage}" />
```

```html title="Inner.html"
<script>
  import { props } from "olum";
  const { onMessage } = props();
  const sayHello = () => onMessage({ text: "Hello!" });
</script>

<button onclick="sayHello()">Click to say hello</button>
```

### 渡すのは関数の名前、インラインのコードは決して渡さない {#pass-a-function-name-never-inline-code}

関数の prop は**名前**でなければなりません。このコンポーネントのトップレベルの関数か、（さらに下へ渡すために）`props()` から取り出した名前のどちらかです。

```html title="Parent.html"
<script>
  import Input from "./Input";          // YOUR component (Input.html)
  const handleInput = (e) => (state.text = e.target.value);
</script>

<Input oninput="{handleInput}" />        <!-- ✓ a name -->

<Input oninput="() => console.log(123)" />     <!-- ✗ arrives as the TEXT "() => console.log(123)" -->
<Input oninput="{() => console.log(123)}" />   <!-- ✗ inline function: arrives as undefined -->
<Input oninput="{state.handlers.input}" />     <!-- ✗ not a plain name: arrives as undefined -->
<Input oninput="{makeHandler(id)}" />          <!-- ✗ passes what the call returns, not a function -->
```

Olum は警告を出しません。子がそれを呼んだときに `oninput is not a function` で失敗します。解決方法はいつも同じです：`<script>` で関数に名前を付け、その名前を渡します。

:::warn
このルールは**自作のコンポーネント**（PascalCase）**だけ**のものです。通常の HTML タグ（小文字）では、`on*` は本物の DOM イベントなので、インラインのコードで問題ありません（[イベント](/docs/events)）：

```html title="Component.html"
<input oninput="e => console.log(123)" />    <!-- ✓ HTML <input>: inline code works -->
<Input oninput="e => console.log(123)" />    <!-- ✗ your <Input/> component: needs "{handler}" -->
```

`onclick` でさえ、コンポーネントではただの prop です：`<CustomButton onclick="{handleClick}" />` は子に関数を渡し、いつ呼ぶかは子が決めます（たとえば自身の `<button onclick="onclick()">` から）。
:::

**関数に、どの項目のためのものかを知らせたい場合は？** タグの中で引数をあらかじめ埋めることはできません。項目を prop として渡し、子から送り返してもらいます：

```html title="List.html"
<!-- ✗ doesn't work -->
<for each="row of state.rows" key="row.id">
  <Row onPick="{() => pick(row.id)}" />
</for>

<!-- ✓ pass the row; the child calls onPick(row.id) -->
<for each="row of state.rows" key="row.id">
  <Row row="{row}" onPick="{pick}" />
</for>
```

**中間のコンポーネントを経由して渡す**には、prop をもう一度渡すだけです：

```html title="Outer.html"
<script>
  import Inner from "./Inner";
  import { props } from "olum";
  const { onMessage } = props();
</script>

<Inner onMessage="{onMessage}" />
```

**別のコンポーネントのスロットの中**でも動きます。名前は、そのタグを書いたファイルの中から探されます：

```html title="Page.html"
<script>
  import Section from "./Section";
  import Card from "./Card";
  const pick = (id) => (state.picked = id);
</script>

<Section>
  <Card onPick="{pick}" />   <!-- `pick` from Page.html arrives fine -->
</Section>
```

## props は読み取り専用 {#props-are-read-only}

データは props を通って**下へ**流れ、変更は関数の props を通って**上へ**伝わります。子は prop を変更できません：

- `props().x = …` と代入しても何も起きません（警告が出ます）。
- 分割代入した名前に代入すると（`color = "x"`）、`Assignment to constant variable` が投げられます。

代わりに、親が関数を渡し、子はそれを呼んで変更を依頼します：

```html title="Parent.html"
<script>
  import CounterCard from "./CounterCard";
  const state = { score: 0 };
  const setScore = (n) => (state.score = n);
</script>

<CounterCard value="{state.score}" onChange="{setScore}" />
```

```html title="CounterCard.html"
<script>
  import { props } from "olum";
  const { value, onChange } = props();
  const inc = () => onChange(value + 1);
</script>

<button onclick="inc()">{value} +1</button>
```

親が自分の `state` を更新し、新しい値が子へ流れ戻ります。動く例：[`/forms/callback-props`](/forms/callback-props)（親のパスコードを編集するキーパッド）。

**多くの**コンポーネントが同じ値を読み書きする必要がある場合は、すべての階層に props を渡すのではなく、[グローバルストア](/docs/store/global-store)を使ってください。
