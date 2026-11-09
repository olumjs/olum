---
title: インポート
group: コンポーネント
order: 200
source: 0f5ac1d5a82a
---

普通の JS モジュールと同じように、`<script>` の中でコンポーネントや任意の JavaScript をインポートします：

```html title="Component.html"
<script>
  import Navbar from "./components/Navbar";
  import { formatDate } from "./utils";
</script>
```

コンポーネントは `.html` を**付けずに**ファイル名でインポートします（各 `.html` ファイルは `.js` ファイルにコンパイルされます）。
