# Introduction

## What's imgit?

Reads `image it` — imgit is a JavaScript package and set of plugins for popular web frameworks to enhance user experience when interacting with media-heavy websites, such as blogs, landings, portfolios and documentation sites.

## Why use imgit?

Use imgit to automate optimization of media content referenced in sources of a website or application, such as HTML, markdown or JSX.

Consider source markdown page of a website built with static site generator (SSG), such as [Starlight](https://starlight.astro.build) or [VitePress](https://vitepress.dev):

```md
...
![](https://host.name/image.jpg)
...
<video src="https://host.name/video.mp4"></video>
...
<iframe src="https://www.youtube.com/embed/id"></iframe>
```

— the page includes multiple images and video hosted remotely and a YouTube embed. Should we build without any optimizations and navigate to an anchor in the midst of the page, it'll look as follows:

![](https://i.gyazo.com/b2f45680247820c398682d7150fca566.mp4)

The page constantly scrolls while loading, the content is shown abruptly and it takes significant time until everything is finally stable, resulting in poor user experience. [PageSpeed Insights](https://pagespeed.web.dev) helps identify the issues and suggests solutions:

![](https://i.gyazo.com/70bc3426fa97e71f2f377d1f7819d267.png)

— there are several recommendations for improving performance and UX, each of which imgit will take care of.

::: info NOTICE
Find sample project discussed here on GitHub: https://github.com/elringus/imgit-showcase. Please note, that the insights screenshot above was modified for brevity. Do not consider this as a benchmark of the underlying web framework.
:::

### Prevent Layout Shift

### Encode to AV1/AVIF

### Lazy-load

### Generate Covers

### Downscale

### Support High-DPI Displays

### Support Legacy Browsers

### Optimize YouTube Embeds

### Embed SVG

### Use Exotic Files

Aside from performance and UX improvements, imgit also allows referencing most of the known media files directly in the page sources. For example, you can keep images in PSD (Photoshop document) and directly reference them in sources:

```md
![](/banner.psd)
```

— imgit will automatically convert the file and build appropriate HTML for display on the web. It'll also detect when source file is modified and re-encode on build.

## How imgit works?
