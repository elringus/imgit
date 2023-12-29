# Plugins

Each of the seven document [transformation stages](/guide/introduction#how) has hooks allowing to override the default behaviour either completely or on per-asset basis. The hooks are specified in imgit config in form of plugin objects. Below is an example on injecting built-in YouTube plugin:

```ts
import { boot } from "imgit/server";
import youtube from "imgit/youtube";

await boot({ plugins: [youtube()] });
```

The plugin object in this case is created from a function that also accepts optional configuration object:

```ts
await boot({ plugins: [youtube({ title: false })] });
```
— this will remove titles from the YouTube's HTML.

Plugin objects has nine total hooks: 7 for each transformation stage, 1 for serving the assets (eg, to upload to a CDN) and another for injecting client-side assets, such JavaScript modules and CSS. Consult API reference for details.

Each transformation stage hook is a function, that accepts same input as the built-in handler and is expected to return either `boolean` or `Promise<boolean>`. Return `true` to prevent built-in handler from processing the asset at that stage, `false` otherwise.

Below is an example on plugging into capture stage to exclude assets captured inside markdown's code blocks used for this documentation:

```ts
import { Plugin, CapturedAsset, stages } from "imgit/server";

// Export plugin object with capture stage hook.
export default { capture } satisfies Plugin;

function capture(content: string, assets: CapturedAsset[]): boolean {
    // Run default capture behaviour.
    stages.capture.capture(content, assets);
    // When nothing is captured, do nothing.
    if (assets.length === 0) return true;
    // Find code block ranges in the source document.
    const ranges = findCodeRanges(content);
    // When found, exclude the assets inside the ranges.
    if (ranges.length > 0)
        assets.splice(0, assets.length,
            ...assets.filter(a => !isInCodeBlock(a, ranges)));
    return true;
}
```

The plugin can now be injected to imgit:

```ts [index.ts]
import { boot } from "imgit/server";
// Import plugin object.
import plugin from "./plugin.ts";

// Inject plugin object.
await boot({ plugins: [plugin] });
```
