---
title: スロット
group: コンポーネント
order: 170
source: 236ef6cfd7c4
---

コンポーネントのタグの**間に**書いたものは、すべて `children` として子に渡されます：

```html title="Parent.html"
<CounterCard title="Score">
  <em>passed from the parent</em>
</CounterCard>
```

```html title="CounterCard.html"
<script>
  import { props } from "olum";
  const { children } = props();
</script>

<div class="slot">{children}</div>
```

他の props と同じく、`children` は[常に最新](/docs/components#reading-props-in-the-child)です。親が後から別の内容を渡せば、`{children}` は新しい内容を表示します。`{props().children}` でも動きます。

## フォールバックの内容 {#fallback-content}

何も渡されなかったとき、`children` は空になります。`<if>` / `<else>` でフォールバックを表示しましょう：

```html title="Box.html"
<script>
  import { props } from "olum";
  const { children } = props();
</script>

<div class="box">
  <if when="children">{children}</if>
  <else><em>no content was provided</em></else>
</div>
```

```html title="Parent.html"
<Box><p>This is a box.</p></Box>   <!-- shows the paragraph -->
<Box />                            <!-- shows the fallback -->
```

:::note
スロットの内容は、あなた自身のテンプレートから来るものなので、エスケープされたテキストではなく**本物の HTML** として挿入されます。信頼できないテキストをスロット経由で渡してはいけません。[エスケープとセキュリティ](/docs/security)を参照してください。
:::
