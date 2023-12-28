# Introduction

## What's imgit?

Reads `image it` — imgit is a JavaScript package and set of plugins for popular web frameworks to enhance user experience when interacting with media-heavy websites, such as blogs, landings, portfolios and documentation sites.

## Why use imgit?

Use imgit to automate optimization of media content referenced in sources of a website or application, such as HTML, markdown or JSX.

Consider source markdown page of a website built with static site generator (SSG), such as [Starlight](https://starlight.astro.build) or [VitePress](https://vitepress.dev):

```md
*test* [d](dsff)
```

— the page includes multiple images and video hosted remotely and a YouTube embed. Should we build without any optimizations and navigate to an anchor in the midst of the page, it'll look as follows:

![](https://i.gyazo.com/b2f45680247820c398682d7150fca566.mp4)

The page constantly scrolls while loading, the content is shown abruptly and it takes significant time until everything is finally stable, resulting in poor user experience. These issues are common in modern web; [PageSpeed Insights](https://pagespeed.web.dev) helps identify the causes and suggest solutions:

![](https://i.gyazo.com/b11e66bce122a1eac24730e3e87b43b3.png)

— there are several recommendations to improve performance and UX, each of which imgit will take care of.

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

Aside from performance and UX improvements, imgit also allows referencing most of the known media files directly in the page sources. For example, you can keep banners or logo sources in PSD (Photoshop document) and directly reference them in sources:

```md
<span>&#33;</span>[](/banner.psd)
```

— imgit will automatically convert the file and build appropriate HTML for display on the web. It'll also detect when source file is modified and re-encode.

## How imgit works?
