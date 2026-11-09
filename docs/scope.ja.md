---
title: Props とメソッドのスコープ
group: コンポーネント
order: 210
source: 407ccaae6156
---

デフォルトでは、コンポーネントの `<script>` 内のものはすべて**プライベート**で、他のコードからは見えません。一部を**パブリック**にすると、[`scope()`](#reading-a-component-from-outside-scope) で外部から読み取れるようになります。

:::note
このページでの **「props」** はコンポーネントのトップレベルの `const` の値（親が渡す `props()` ではありません）を、**「methods」** はその関数を意味します。
:::

- **Props**：単純な値（リテラル、オブジェクト、配列、三項演算子、別の名前）を持つトップレベルの `const`。
- **Methods**：トップレベルの関数（`function fn() {}` または `const fn = () => …`）。
- それ以外のもの（`const x = compute()` など）もコンポーネント内では普通に動きますが、パブリックにはできません。
- `state` は prop として扱われます。

## パブリックにする {#making-things-public}

`<script>` タグにキーワードを付けます：

```html title="Component.html"
<script public> … </script>            <!-- all props AND methods public -->
<script public-props> … </script>      <!-- only props public -->
<script public-methods> … </script>    <!-- only methods public -->

<script private> … </script>           <!-- everything private (the default) -->
<script private-props> … </script>
<script private-methods> … </script>
```

## `exclude-*` による例外 {#exceptions-with-exclude-}

`exclude-<name>` は、**1 つ**の項目をそのグループと逆の設定にします：

| この後に… | `exclude-x` で `x` は… |
|--------|------------------------|
| `public`、`public-props`、`public-methods` | プライベート |
| `private`、`private-props`、`private-methods` | パブリック |

```html title="Component.html"
<script public-props exclude-age exclude-name private-methods exclude-get-age>
  const age     = 30;
  const name    = "Ann";
  const role    = "admin";

  const getAge  = () => age;
  const getRole = () => role;
</script>

<!--
  props:   public, except age and name  →  role is public
  methods: private, except getAge       →  getAge is public
-->
```

:::tip
他の props をパブリックにしつつ `state` をプライベートにしておくには、`public-props` の後に `exclude-state` を付けます。
:::

### 順番が大事 {#order-matters}

属性は**左から右へ**読まれます。各キーワードがグループを開始し、その後ろの `exclude-*` は次のキーワードまでそのグループに属します：

```text title="reading order"
public-props   exclude-age   exclude-name   private-methods   exclude-get-age
└──────────── props group ───────────────┘  └──────── methods group ───────┘
```

### 名前は kebab-case で書く {#write-names-in-kebab-case}

HTML の属性名は大文字を区別しないので、camelCase の名前はダッシュで区切って書きます。Olum が元に戻してくれます：

```text title="naming"
getAge    →  exclude-get-age
userName  →  exclude-user-name
isActive  →  exclude-is-active
```

## コンポーネントを外部から読み取る：`scope()` {#reading-a-component-from-outside-scope}

`scope()` は、**ページ上の**コンポーネントを名前で見つけます。どこからでも呼べます（別のコンポーネント、コンソール、テスト）：

```js
import { scope } from "olum";

const badge = scope("StatusBadge");
badge.props;    // its PUBLIC props
badge.methods;  // its PUBLIC methods
badge.state;    // its live state (changing it updates that component)
badge.el;       // its root element
badge.key;      // its internal instance key
```

- ページ上に複数ある場合は、どれかを指定します：`scope("Item", 2)`。
- 見つからない場合 → `null` を返し、警告を出します。

:::tip
`scope()` は非常口のようなものです。複数のコンポーネントで意図的に共有するデータには、[グローバルストア](/docs/store/global-store)を使ってください。
:::
