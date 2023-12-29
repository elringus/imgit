# Astro

[Astro](https://astro.build) is a popular web framework. It has `integrations` option, where you can inject imgit to perform the transformations over the project content.

::: code-group

```ts [astro.config.mts]
import { defineConfig } from "astro/config";

// Importing imgit integration for astro, as well as imgit plugins
// for YouTube and SVG. In order for relative imports to work
// set 'moduleResolution' to 'bundler' in tsconfig.json.
import imgit from "imgit/astro";
import youtube from "imgit/youtube";
import svg from "imgit/svg";

export default defineConfig({
    // Configure and inject imgit. In this case we set width threshold
    // to 800px, so that when content is larger it'll be scaled down,
    // while high-res original will still be shown on high-dpi displays.
    // We also install YouTube and SVG plugins to imgit.
    integrations: [imgit({ width: 800, plugins: [youtube(), svg()] })]
});
```

:::

::: tip Sample
https://github.com/elringus/imgit/tree/main/samples/astro
:::
