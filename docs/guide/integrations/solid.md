# SolidStart

[SolidStart](https://start.solidjs.com) is a fullstack web framework built on top of popular Solid library. It has `vite.plugins` option, where you can inject imgit to perform the transformations over the project content.

::: code-group

```ts [vite.config.ts]
import { defineConfig } from "@solidjs/start/config";

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
    // We also install YouTube and SVG plugins to imgit and make
    // it produce JSX.
    plugins: [imgit({ width: 800, plugins: [youtube(), svg()] })]
});
```

:::

::: tip Sample
https://github.com/elringus/imgit/tree/main/samples/solid
:::
