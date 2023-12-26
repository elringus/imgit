---
layout: home

title: imgit
titleTemplate: Convert media links to optimized HTML

hero:
  name: imgit
  text: Convert media links to optimized HTML
  tagline: Images, video and YouTube: fetch, encode, scale, lazyload – for best UX and [Web Vitals](https://web.dev/vitals).
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/elringus/imgit
  image:
    src: /img/hero.webp
    alt: imgit

features:
  - icon: ✨
    title: Transformative
    details: Builds optimized HTML for arbitrary image, video and YouTube syntax, such as URLs, markdown or JSX tags.
  - icon: ⚡
    title: Accelerating
    details: Encodes to the modern AV1/AVIF format compressing by up to 90% without noticeable quality loss. Supports GPU acceleration.
  - icon: ♻️
    title: Polyglot
    details: Works with most known media formats: JPEG, PNG, APNG, SVG, GIF, WEBP, WEBM, MP4, AVI, MOV, MKV, BMP, TIFF, TGA and even PSD.
  - icon: 🌊
    title: Smooth
    details: Generates tiny blurred covers from the source content to be beautifully crossfaded into HD originals once lazy-loaded.
  - icon: 📐
    title: Adaptive
    details: Optionally scales down the content to specified threshold while preserving high-resolution variants for high-DPI displays.
  - icon: 🌐
    title: Outgoing
    details: Fetches from remote sources, such as image hostings. Uploads optimized content to designated endpoint, such as CDN.
  - icon: 🗺️
    title: Omnipresent
    details: Built-in plugins for Astro, SvelteKit, SolidStart, VitePress, Nuxt and Remix. Adapters for Node, Deno and Bun runtimes.
---

<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #bd34fe 30%, #41d1ff);

  --vp-home-hero-image-background-image: linear-gradient(-45deg, #bd34fe 50%, #47caff 50%);
  --vp-home-hero-image-filter: blur(44px);
}

@media (min-width: 640px) {
  :root {
    --vp-home-hero-image-filter: blur(56px);
  }
}

@media (min-width: 960px) {
  :root {
    --vp-home-hero-image-filter: blur(68px);
  }
}
</style>
