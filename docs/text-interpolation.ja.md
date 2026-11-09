---
title: テキスト補間
group: リアクティビティ
order: 40
source: a6941c575829
---

JavaScript の値を `{ }` で囲むと、HTML の中に表示できます。値は常に安全なテキストとして表示されます：

```html title="Component.html"
<p>Hello {state.user.name}</p>
<p>Total: {state.items.length} items</p>
<p>{state.count > 0 ? 'positive' : 'zero'}</p>
```

## 知っておくと良いこと {#good-to-know}

- 値は **HTML エスケープ**されるので、`<b>` のようなテキストは HTML ではなくテキストとして表示されます。これにより XSS から守られます。本物の HTML を表示するには[生の HTML](/docs/raw-html)を参照してください。
- `null` と `undefined` は何も表示されません。
- テキスト中で **`{` をエスケープする方法はありません**。`{…}` はすべてコードとして扱われます。`{` そのものを表示するには、`{String.fromCharCode(123)}` と書くか、`"{"` を `const` に入れてそれを表示します。
