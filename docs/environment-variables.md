---
title: Environment Variables
group: Build & SEO
order: 225
---

Put settings that differ between your computer and the live site, like an API address, in `.env` files and read them in your code as `process.env.NAME`.

```text title=".env.development"
API_URL="http://localhost:3000"
```

```text title=".env.production"
API_URL="https://api.example.com"
```

```html title="src/page.html"
<script>
  import { onMount } from "olum";
  const state = { posts: [] };

  onMount(async () => {
    const res = await fetch(process.env.API_URL + "/posts");
    state.posts = await res.json();
  });
</script>
```

`npm run dev` talks to `http://localhost:3000`, and the site you build talks to `https://api.example.com`. No code changes.

## Which file is used

The files go in the project root, next to `package.json`:

| Command | Reads |
|---------|-------|
| `npm run dev` | `.env`, then `.env.development` |
| `npm run build` | `.env`, then `.env.production` |

- `.env` is optional and holds values shared by both. When a name is in both files, the second file wins.
- If you only have a `.env`, it's used for dev **and** build.
- No files at all → `process.env` is an empty object.

## File format

```text title=".env"
# a line starting with # is a comment
API_URL=https://api.example.com
export SITE_NAME="My Shop"    # quotes and `export` are optional
GREETING="Hello\nWorld"       # \n is a new line, inside double quotes only
```

**Every value is a string.** Convert it yourself:

```js
if (process.env.DEBUG) {}                        // ✗  DEBUG=false is the string "false", which is truthy
if (process.env.DEBUG === "true") {}             // ✓
const pageSize = Number(process.env.PAGE_SIZE);  // ✓  "20" → 20
```

Use names made of letters, digits and `_` (`API_URL`, `apiUrl`).

## Everything here is public

:::danger[Never put secrets in these files]
These values are **included in the build**: they're written into the bundled JS, and every visitor's browser downloads them, where anyone can read them. Addresses and feature switches are fine. **Critical credentials** (secret API keys, database passwords, private tokens) must live in a **separate backend**: your app calls that backend, and only the backend uses the secret.
:::

## How it works

- **In dev**, your values go into a small generated module that sets `process.env`. `main.js` imports it first, so it runs before any of your code. Inline scripts in `public/index.html` run before it, so they can't read it.
- **In a build**, every `process.env.NAME` you write out in full is replaced by its value in the bundled JS. Code behind a check that can never pass (`if (process.env.DEBUG === "true")` with `DEBUG=false`) is dropped from the bundle.
- In a build, `process.env[name]` and names that aren't in the file are `undefined`. Write each name out in full.

## Good to know

- **Restart `npm run dev` after editing a `.env` file.** The dev server reads them when it starts.
- `process.env.NODE_ENV` is not one of your values: a build turns it into `"production"`, and in dev it's `undefined` unless you add it to `.env.development`.
- Don't create `process` yourself in `public/index.html` (`const process = { env: {} }`). It hides the values Olum adds, so `process.env` reads empty in dev.
