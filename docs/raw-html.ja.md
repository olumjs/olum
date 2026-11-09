---
title: 生の HTML
group: テンプレート構文
order: 140
source: 484fb799da47
---

`{expr}` は常にテキストとして表示され、HTML にはなりません。どうしても HTML を挿入したいときは、2 つの方法があります。**信頼できる HTML にだけ使ってください**（[エスケープとセキュリティ](/docs/security)を参照）。

## `html="expr"`：要素の中身を埋める {#htmlexpr-fill-an-element}

要素の中身がその HTML になります（既存の子要素は置き換えられます）：

```html title="Component.html"
<div html="state.articleHtml"></div>
<span html="state.richText"></span>
```

## `olum.html(value)`：インライン {#olumhtmlvalue-inline}

HTML が他のテキストの途中にあるときは、`{ }` の中で使います：

```html title="Component.html"
<p>Intro: {olum.html(state.snippetHtml)} — end.</p>
```

どちらもコード内で検索しやすいので、生の HTML がどこで使われているかを簡単にレビューできます。それ以外はすべてエスケープされます。
