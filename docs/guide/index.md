# Introduction

## What's imgit?

Reads `image it` — imgit is a JavaScript package and set of plugins for popular web frameworks that employs various techniques to enhance user experience when interacting with media-heavy websites, such as blogs, landings, portfolios and documentation sites.

## Why use imgit?

Use imgit to automate optimization of media content referenced in sources of a website or application, such as HTML, markdown or JSX.

Consider source markdown page of a website built with static site generator (SSG), such as [Starlight](https://starlight.astro.build) or [VitePress](https://vitepress.dev):

```md
*test* [d](dsff)
```

— the page has multiple images and video with sources hosted on an image hosting and a YouTube player embedded via iframe. Should we build without any optimizations and attempt to navigate to an anchor in the midst of the page, it'll look as follows:

The page constantly scrolls while loading, the content is shown abruptly and it takes significant time until everything is finally stable, resulting in poor user experience. These issues are common in modern web and there are services to identify the problems and suggest solutions, such as [PageSpeed Insights](https://pagespeed.web.dev):

— there are several recommendations to improve performance and UX, each of which imgit will take care of.

### Preventing Layout Shift

### Encoding to AV1/AVIF

### Lazy Loading

### Covers Generation

### Downscaling

### Supporting High-DPI Displays

### Supporting Legacy Browsers

### Optimizing YouTube Embeds

### Embedding SVG

### Using Exotic Files

Aside from performance and UX improvements, imgit also allows referencing most of the known media files directly in the page sources. For example, you can keep banners or logo sources in PSD (Photoshop project file) and directly reference them in sources:

```md
<span>&#33;</span>[](/banner.psd)
```

— imgit will automatically convert the file and build appropriate HTML for display on the web. It'll also detect when source file is modified and re-encode.

## How imgit works?
