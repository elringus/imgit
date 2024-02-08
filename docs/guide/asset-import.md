# Asset Import

By default, imgit is set up to detect and transform Markdown syntax in the source content. This works best for simple documentation and blog websites, but may not be flexible enough for more complex apps authored with frameworks like React.

To better fit component-based apps, imgit allows importing media assets with `import` statement to manually author the desired HTML.

Use `imgit:` namespace when importing a media asset to make imgit optimize it and return sources of the generated assets. For example, consider following [Astro](https://astro.build) page:

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

Imported asset returns following default export:

```ts
type AssetImport = {
    content: {
        encoded: string,
        dense?: string,
        cover?: string,
        safe?: string
    },
    info: {
        type: string,
        height: number,
        width: number,
        alpha: boolean
    }
};
```

— where `content` are the sources of the generated optimized files, which you can assign to the various `src` attributes of the built HTML. Additional `info` object contains metadata describing the imported asset, such its dimensions and MIME type, which may be helpful when building the host component.

::: tip
When using TypeScript, add `/// <reference types="imgit/client" />` to a `.d.ts` file anywhere under project source directory to correctly resolve virtual asset imports.
:::
