# Getting Started

Make sure [ffmpeg](https://ffmpeg.org) version 6.0 or later is available in system path. You can either [build from source](https://trac.ffmpeg.org/wiki/CompilationGuide) or install from a package manager:

::: code-group

```sh [Linux]
apt install ffmpeg
```

```sh [Mac]
brew install ffmpeg
```

```sh [Windows]
choco install ffmpeg
```

:::

::: tip
It's possible to swap ffmpeg with an alternative solution (eg, remote encoding service) via probe and encode hooks, allowing to use imgit in constraint environments, such as edge runtimes.
:::

Install imgit as a dev dependency from NPM:

::: code-group

```sh [npm]
npm install -D imgit
```

```sh [yarn]
yarn add -D imgit
```

```sh [pnpm]
pnpm add -D imgit
```

```sh [bun]
bun add -D imgit
```

:::

When using any of the supported web frameworks continue on the dedicated page:

 - [Astro](/guide/integrations/astro)
 - [Nuxt](/guide/integrations/nuxt)
 - [Remix](/guide/integrations/remix)
 - [SolidStart](/guide/integrations/solid)
 - [SvelteKit](/guide/integrations/svelte)
 - [VitePress](/guide/integrations/vitepress)

In case your framework is not on the list, but supports Vite plugins, continue on [Vite](/guide/integrations/vite).

Otherwise, use imgit directly to transform source documents. For example, giving following `./index.html` file:

```html
<html lang="en">

<head>
    <!-- Import imgit CSS (usually bundled with other stylesheets). -->
    <link rel="stylesheet" type="text/css"
          href="https://unpkg.com/imgit/dist/client/styles.css">
</head>

<body>
<!-- Specify media content as markdown images (syntax is configurable). -->
![](https://github.com/elringus/imgit/raw/main/samples/assets/png.png)
![](https://github.com/elringus/imgit/raw/main/samples/assets/mp4.mp4)
![](https://www.youtube.com/watch?v=arbuYnJoLtU)
<!-- Import imgit module (usually bundled with other client-side JS). -->
<script type="module" src="https://unpkg.com/imgit/dist/client"></script>
</body>

</html>
```

Run following script:

```js
import { boot, transform, exit } from "imgit/server";
import fs from "node:fs/promises";

// Configure imgit server. In this case we're setting width threshold
// to 800px, so that when content is larger it'll be scaled down,
// while high-res original will still be shown on high-dpi displays.
await boot({ width: 800 });

// Read sample HTML document with images and video referenced
// via markdown image tags: ![](url). The format can be changed
// in boot config, for example to capture custom JSX tags instead.
const input = await fs.readFile("./index.html", { encoding: "utf8" });

// Run the imgit transformations over sample HTML content.
// This will capture images and video syntax, fetch the remote files,
// encode them to AV1/AVIF, generate covers, dense and safe variants
// when necessary, serve generated files (in this minimal case we just
// write them to 'public' directory; usually you'd upload to a CDN) and
// return transformed content where captured syntax is replaced with
// <picture> and <video> HTML tags referencing generated files.
const output = await transform(input);

// Write the transformed HTML under 'public' directory.
await fs.writeFile("./public/index.html", output);

// Shutdown imgit server. Will cache the results of the transform
// operations, such as probing results, encoding profiles, generated covers
// and parameters of the source files. On consequent runs the server will
// skip most operations in case the cache is valid and source file is not
// modified. Cache files are written under 'public/imgit' directory (can be
// changed in boot config).
await exit();
```

::: tip Example
Find minimal sample on using imgit directly with Deno runtime on GitHub: https://github.com/elringus/imgit/tree/main/samples/minimal.
:::


Find available configuration options in the API reference. For available extension points (hooks), check out [plugins guide](/guide/plugins).
