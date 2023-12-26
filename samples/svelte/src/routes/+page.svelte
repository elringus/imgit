<script context="module">
	import "imgit/client";
	import "imgit/client/youtube";
	import "imgit/styles";
	import "imgit/styles/youtube";
</script>

<style>
    :global(body) { color: #ccc; background: #222; font-family: monospace; }
    :global(img), :global(video), :global(svg) { max-width: 100%; height: auto; }
</style>

<!-- This file will be transformed by imgit on build. Markdown image
     tags below will be replaced with <picture> and <video> HTML tags referencing
     generated content. Transformed files will be written under 'public' directory. -->

<h1>Image</h1>

<h3>PNG</h3>

<!-- When eager option is specified, the image will not be lazy-loaded; use for the
     above the fold content: https://web.dev/articles/lazy-loading-best-practices. -->
![?eager](https://github.com/elringus/imgit/raw/main/samples/assets/png.png)

<h3>JPG</h3>

![](https://github.com/elringus/imgit/raw/main/samples/assets/jpg.jpg)

<h3>WEBP</h3>

![](https://github.com/elringus/imgit/raw/main/samples/assets/webp.webp)

<h3>AVIF</h3>

![](https://github.com/elringus/imgit/raw/main/samples/assets/avif.avif)

<h3>BMP</h3>

![](https://github.com/elringus/imgit/raw/main/samples/assets/bmp.bmp)

<h3>TIF</h3>

![](https://github.com/elringus/imgit/raw/main/samples/assets/tif.tif)

<h3>TIFF</h3>

![](https://github.com/elringus/imgit/raw/main/samples/assets/tiff.tiff)

<h3>TGA</h3>

![](https://github.com/elringus/imgit/raw/main/samples/assets/tga.tga)

<h3>PSD</h3>

![](https://github.com/elringus/imgit/raw/main/samples/assets/psd.psd)

<h1>Animation</h1>

<h3>GIF</h3>

![](https://github.com/elringus/imgit/raw/main/samples/assets/gif.gif)

<h3>APNG</h3>

![](https://github.com/elringus/imgit/raw/main/samples/assets/apng.apng)

<h1>Video</h1>

<h3>MP4</h3>

![](https://github.com/elringus/imgit/raw/main/samples/assets/mp4.mp4)

<h3>WEBM</h3>

![](https://github.com/elringus/imgit/raw/main/samples/assets/webm.webm)

<h3>AVI</h3>

![](https://github.com/elringus/imgit/raw/main/samples/assets/avi.avi)

<h3>MKV</h3>

![](https://github.com/elringus/imgit/raw/main/samples/assets/mkv.mkv)

<h3>MOV</h3>

![](https://github.com/elringus/imgit/raw/main/samples/assets/mov.mov)

<h1>Merge</h1>

<!-- Merge option allows merging multiple assets into one. In this case this will
     make the image display different sources depending on the window width. We're
     also overriding global width threshold for the wider image with the 'width' option. -->
![?width=1200&media=(min-width:800px)](https://github.com/elringus/imgit/raw/main/samples/assets/art-wide.jpg)
![?media=(max-width:799px)&merge](https://github.com/elringus/imgit/raw/main/samples/assets/art-square.jpg)

<h1>YouTube</h1>

<!-- When YouTube plugin is installed, will build lazy-loaded picture element with the
     video's thumbnail, which is transformed into embedded iframe player when licked
     Custom video title can be defined via alt spec. -->
![Oahu Hawaii – Island in the Sun](https://www.youtube.com/watch?v=arbuYnJoLtU)

<h1>SVG</h1>

<!-- When SVG plugin is installed, will embed content of the svg file into HTML. -->
![](https://github.com/elringus/imgit/raw/main/samples/assets/svg.svg)
