# VitePress

[VitePress](https://vitepress.dev/) is a static site generator built on top of popular Vue library. It has `vite.plugins` option, where you can inject imgit to perform the transformations over the project content.

::: code-group

```ts [.vitepress/config.ts]
import { defineConfig } from "vitepress";

// Importing imgit plugin for vite, as well as imgit plugins
// for YouTube and SVG. In order for relative imports to work
// set 'moduleResolution' to 'bundler' in tsconfig.json.
import imgit from "imgit/vite";
import youtube from "imgit/youtube";
import svg from "imgit/svg";

export default defineConfig({
    // Configure and inject imgit. In this case we set width threshold
    // to 800px, so that when content is larger it'll be scaled down,
    // while high-res original will still be shown on high-dpi displays.
    // We also install YouTube and SVG plugins to imgit.
    vite: { plugins: [imgit({ width: 800, plugins: [svg(), youtube()] })] }
});
```

:::

Due to a bug in VitePress (https://github.com/vuejs/vitepress/issues/3314), client-side assets have to be manually imported:

::: code-group

```ts [.vitepress/theme/index.ts]
import DefaultTheme from "vitepress/theme";

import "imgit/styles";
import "imgit/styles/youtube";
import "imgit/client";
import "imgit/client/youtube";

export default { extends: { Layout: DefaultTheme.Layout } };
```

:::

::: tip Sample
https://github.com/elringus/imgit/tree/main/samples/vitepress
:::
