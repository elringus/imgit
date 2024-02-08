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

When building the project, imgit will automatically transform image Markdown syntax
into optimized HTML. For example, given following `index.md` page:

```md
# PSD Image
![](https://example.com/photo.psd)

# MKV Video
![](/assets/video.mkv)

# YouTube Video
![](https://www.youtube.com/watch?v=arbuYnJoLtU)
```

— imgit will produce following HTML output:

```html
<h1>PSD Image</h1>
<picture><source srcset="optimized-source.avif"></picture>

<h1>MKV Video</h1>
<video src="optimized-source.av1"></video>

<h1>YouTube Video</h1>
<div>optimized YouTube player</div>
```

In case you'd like to instead manually build the HTML (eg, with custom components), import the media assets with `imgit:` namespace:

```astro
---
import psd from "imgit:https://example.com/photo.psd";
import mkv from "imgit:/assets/video.mkv";
---

<img src={psd.content.encoded}
     height={psd.info.height}
     loading="lazy"/>

<video src={mkv.content.encoded}
       poster={mkv.content.cover}
       height={mkv.info.height}
       autoplay loop/>
```

When using TypeScript, add `/// <reference types="imgit/client" />` to a `.d.ts` file anywhere inside project source directory to correctly resolve virtual asset imports.

::: tip SAMPLE
https://github.com/elringus/imgit/tree/main/samples/astro
:::
