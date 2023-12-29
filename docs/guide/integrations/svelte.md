# SvelteKit

[SvelteKit](https://kit.svelte.dev) is a fullstack web framework built on top of popular Svelte library. It has `vite.plugins` option, where you can inject imgit to perform the transformations over the project content.

::: code-group

```ts [vite.config.ts]
import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";

// Importing imgit plugin for vite, as well as imgit plugins
// for YouTube and SVG. In order for relative imports to work
// set 'moduleResolution' to 'bundler' in tsconfig.json.
import imgit from "imgit/vite";
import youtube from "imgit/youtube";
import svg from "imgit/svg";

export default defineConfig({
    plugins: [
        // Configure and inject imgit. In this case we set width threshold
        // to 800px, so that when content is larger it'll be scaled down,
        // while high-res original will still be shown on high-dpi displays.
        // We also install YouTube and SVG plugins to imgit.
        imgit({
            width: 800,
            plugins: [youtube(), svg()],
            // We also have to override assets root, as SvelteKit
            // opted for 'static' instead of more common 'public'.
            root: "./static",
            cache: { root: "./static/imgit" },
            fetch: { root: "./static/imgit/fetched" },
            encode: { root: "./static/imgit/encoded" }
        }),
        // Note that imgit is injected before svelte plugin:
        // it won't work otherwise.
        sveltekit()
    ]
});
```

:::

::: tip Sample
https://github.com/elringus/imgit/tree/main/samples/svelte
:::
