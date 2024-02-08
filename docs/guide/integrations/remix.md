# Remix

[Remix](https://remix.run) is a popular web framework. It has `vite.plugins` option, where you can inject imgit to perform the transformations over the project content.

::: code-group

```ts [vite.config.ts]
import { defineConfig } from "vite";
import { unstable_vitePlugin as remix } from "@remix-run/dev";

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
    // We also install YouTube and SVG plugins to imgit and enable JSX syntax.
    plugins: [remix(), imgit({ width: 800, plugins: [youtube(), svg()], build: "jsx" })]
});
```

:::

::: tip SAMPLE
https://github.com/elringus/imgit/tree/main/samples/remix
:::
