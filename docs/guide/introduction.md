# Introduction

## What?

Reads `image it` — imgit is a JavaScript package and set of plugins for popular web frameworks to enhance user experience when interacting with media-heavy websites, such as blogs, landings, portfolios and documentation sites.

## Why?

Consider source markdown page of a website built with static site generator (SSG), such as [Starlight](https://starlight.astro.build) or [VitePress](https://vitepress.dev):

```md
...
![](https://host.name/image.jpg)
...
<video src="https://host.name/video.mp4"></video>
...
<iframe src="https://www.youtube.com/embed/id"></iframe>
```

— the page includes multiple images and video hosted remotely and a YouTube embed. Should we build as-is and navigate to an anchor in the midst of the page, it'll look as follows:

<details>
    <summary>Warning: flashing lights</summary>
    ![](https://i.gyazo.com/b2f45680247820c398682d7150fca566.mp4)
</details>

The page constantly scrolls while loading, the content is shown abruptly and it takes significant time until everything is finally stable, resulting in poor user experience. [PageSpeed Insights](https://pagespeed.web.dev) helps identify the issues and suggests solutions.

![?class=dark-only](https://i.gyazo.com/57489480e03593abb47d78c5e1374aa7.png)
![?class=light-only](https://i.gyazo.com/d1f5eb93e57799d1a3cd2abdf438c040.png)

There are several recommendations for improving performance and UX, most of which imgit will take care of. After applying all the optimizations outlined later in the article, we'll get much better results:

![?class=dark-only](https://i.gyazo.com/1bd7705bf63b4fa179e45a7b4445d34e.png)
![?class=light-only](https://i.gyazo.com/4122593cabf787177589cec34e94263c.png)

::: info

- Insights report before optimizations: [pagespeed.web.dev/analysis/2sjav6lfz2](https://pagespeed.web.dev/analysis/https-grand-figolla-604270-netlify-app-src-unoptimized/2sjav6lfz2?form_factor=mobile)
- Insights report after optimizations: [pagespeed.web.dev/analysis/og3qm9vvtr](https://pagespeed.web.dev/analysis/https-grand-figolla-604270-netlify-app-src-optimized/og3qm9vvtr?form_factor=mobile)
- Sample project on GitHub: https://github.com/elringus/imgit-showcase
  :::

### Prevent Layout Shift

The most annoying issue is the page scrolling while the media is being loaded. This is known as [Cumulative Layout Shift](https://web.dev/articles/cls) and happens because browser is not aware of the media height until it's loaded. To fix this, we have to specify content height with HTML. imgit will automatically fetch source content of the media (in case it's hosted remotely), sample the file to determine the dimensions and specify the height in the generated HTML.

### Encode to AV1/AVIF

Another problem is the media size. Our page reference assets with total size of `77MB`. Insights report suggests serving the content in next-gen formats, which imgit will handle as well. After encoding images and video to [AV1/AVIF](https://en.wikipedia.org/wiki/AV1), total size is reduced to `5.7MB` effectively compressing the content by `92%` without noticeable quality loss.

### Lazy-load

All the images and video are fetched and rendered on page load, while user don't even see most of them. imgit will make sure only assets actually visible to the user are fetched and rendered, saving bandwidth and CPU time.

### Generate Covers

Arguably second most annoying UX issue (after layout shift) is the abrupt display of the loaded content. Especially now that we're lazy-loading the assets, they'll pop on both the initial page load and while scrolling.

<details>
    <summary>Without covers</summary>
    ![](https://i.gyazo.com/2f5c124d0bd7c96a91a3bc19a4365850.mp4)
</details>

imgit will generate tiny blurred covers for each asset and embed the content to HTML, making them load in sync with the page. When the content becomes visible to the user, it'll start loading full-res source and, once ready, cross-fade from the blurred cover.

<details>
    <summary>With covers</summary>
    ![](https://i.gyazo.com/845ed7b1a635187b00f93a3e7f2730ae.mp4)
</details>

### Downscale

Most of our assets have resolution of 1920x1080 pixels, while `max-width` of the HTML content layout is 688px. Not only we're wasting bandwidth, but the assets are also down-scaled by browser at runtime with algorithms that sacrifice quality for speed. When width threshold is specified in configuration, imgit will downscale the media at build time with [Lanczos algorithm](https://en.wikipedia.org/wiki/Lanczos_resampling) for best visual quality.

### Support High-DPI Displays

The above stands true for "normal" displays, but when viewed on a high-DPI (aka "Retina") display, the media would actually benefit having more pixels than nominal layout width. When downscaling, imgit will as well preserve the original high-resolution asset and show it in such cases.

### Support Legacy Browsers

While all the mainstream browsers support AV1/AVIF format ([can I use?](https://caniuse.com/avif)), you may still want to ensure the content is visible to users with exotic clients (eg, Internet Explorer) or older versions of the actual browsers. imgit will make sure to generate a "safe" variant for each media element and include associated fallback source to the generated HTML.

### Optimize YouTube Embeds

Official YouTube player embed from Google contains a significant portion of bloatware used mostly for tracking and ad serving, which affect the performance. Instead of embedding the player's `<iframe>` as-is, imgit will build lazy-loaded image poster with fake controls. The player iframe will start loading only after user clicks "play" button ensuring the embed won't affect UX until user starts watching the video. Check sample YouTube embed below.

![Oahu Hawaii – Island in the Sun](https://www.youtube.com/watch?v=arbuYnJoLtU)

### Embed SVG

Vector graphic doesn't exhibit same issues as the raster media discussed above, but in some cases (eg, SVG diagrams mixed with the page content) may benefit from embedding into the page HTML to prevent layout shift and abrupt reveal on load. When configured, imgit will embed SVG assets into HTML on build, so that they're rendered in sync with the rest of the page.

### Use Exotic Formats

Aside from performance and UX improvements, imgit also allows referencing most of the known media files directly in the page sources. For example, you can keep images in PSD (Photoshop document) and directly reference them in sources:

```md
![](/banner.psd)
```

— imgit will automatically convert the file and build appropriate HTML for display on the web. It'll also detect when source file is modified and re-encode on build.

## How?

The package is split in 3 main modules (via [export map](https://nodejs.org/api/packages.html)):

| Module | Package Exports                                           | Description                                                                                                                    |
|--------|-----------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------|
| Server | `imgit/server`                                            | Run at build time to transform the sources and optimize assets. Adapted for Node, Deno and Bun JavaScript runtimes.            |
| Client | `imgit/client`, `imgit/styles`                            | Run in browser to observe and lazy-load visible assets; also CSS to layout and cross-fade covers.                              |
| Plugin | `imgit/vite`, `imgit/astro`, `imgit/youtube`, `imgit/svg` | Integrations with third-party bundlers and web frameworks, as well as optional features, such as YouTube and SVG transformers. |

Transformation function in server module accepts source document (eg, HTML, Markdown or JSX) and replaces configured asset syntax ([md image](https://spec.commonmark.org/0.30/#images) by default) with HTML or JSX referencing optimized assets. Associated asset files are fetched (either from local file system or remote host), optimized and served (either back to local file system or uploaded to a remote host, eg a CDN) at the same time.

![?class=dark-only](/svg/imgit-nutshell-dark.png)
![?class=light-only](/svg/imgit-nutshell-light.png)

<p class="attr">sketched with <a href="https://excalidraw.com" target="_blank">Excalidraw</a></p>

Each input is transformed asynchronously over seven stages: from capturing asset syntax to overwriting document sources — every stage can be hooked to or completely overridden with a plugin on per-asset basis.

### 1. Capture

Given input source document text, captures asset syntax containing references to the source content to be optimized. Regexp used to capture the syntax is configurable via imgit options. Plugin hooks allow controlling how the syntax is captured depending on the source document content and filename; eg, you can completely ignore documents with specific file extensions or reject syntax captured inside specific context.

### 2. Resolve

Parses captured asset syntax to resolve URL of the source content (local or remote) and associated optional metadata, such as title, CSS class, media attributes, etc. Plugin hooks allow controlling the parsing process for assets with specific syntax. For example, YouTube plugin will resolve thumbnail URL based on video link at this stage.

### 3. Fetch

Downloads content of the assets with remote sources. Will retry on fail and handle retry responses common to image hosts. Fetched content is cached, so consequent runs won't re-download same files. Directory to store downloaded files, as well as fetch timeout, retry limit and delay are all configurable. Hook into the stage to override fetch behaviour for some or all the assets.

### 4. Probe

Analyzes the content of the fetched files with [ffrobe](https://ffmpeg.org/ffprobe.html) to resolve media type, size and other parameters required for further processing. Probe results are cached, so the operation is skipped on consequent runs, as long as the cache is valid (source file is not changed). Control the probing with plugin hooks; eg, swap ffrobe with alternative solution.

### 5. Encode

Encodes the file with [ffmpeg](https://ffmpeg.org) and generate additional content: covers, dense and safe variants, etc. The results are cached as well. Encode parameters, such as quality, filters and encode specs are configurable per asset type in imgit options, as well as directory to store encoded and generated files. Hooks allows customizing the encode behaviour for specific assets; or you can opt out of using ffmpeg entirely in favor of something else, such as remote encoding service.

### 6. Build

Builds HTML (or JSX, when enabled in options) referencing the encoded/optimized content. Use hooks to override which HTML is built for specific assets. To upload optimized files to a CDN, this stage provides a dedicated async `serve` hook, which expects URL of the uploaded file in exchange for the built asset info; when implemented, imgit will use resolved remote URL as the source for the built HTML.

### 7. Rewrite

Final stage replaces captured syntax with the built HTML/JSX. Produced document can then be either served as-is or pushed further to the bundler or web framework pipeline for additional transformations.
