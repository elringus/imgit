<!-- This file will be transformed by imgit when bundling with vite. Markdown image
     tags below will be replaced with <picture> and <video> HTML tags referencing
     generated content. Transformed files will be written under 'public' directory. -->

# VitePress Sample

## Image

### PNG

<!-- When eager option is specified, the image will not be lazy-loaded; use for the
     above the fold content: https://web.dev/articles/lazy-loading-best-practices. -->
![?eager](https://github.com/elringus/imgit/raw/main/samples/assets/png.png)

### JPG

![](https://github.com/elringus/imgit/raw/main/samples/assets/jpg.jpg)

### WEBP

![](https://github.com/elringus/imgit/raw/main/samples/assets/webp.webp)

### AVIF

![](https://github.com/elringus/imgit/raw/main/samples/assets/avif.avif)

### BMP

![](https://github.com/elringus/imgit/raw/main/samples/assets/bmp.bmp)

### TIF

![](https://github.com/elringus/imgit/raw/main/samples/assets/tif.tif)

### TIFF

![](https://github.com/elringus/imgit/raw/main/samples/assets/tiff.tiff)

### TGA

![](https://github.com/elringus/imgit/raw/main/samples/assets/tga.tga)

### PSD

![](https://github.com/elringus/imgit/raw/main/samples/assets/psd.psd)

## Animation

### GIF

![](https://github.com/elringus/imgit/raw/main/samples/assets/gif.gif)

### APNG

![](https://github.com/elringus/imgit/raw/main/samples/assets/apng.apng)

## Video

### MP4

![](https://github.com/elringus/imgit/raw/main/samples/assets/mp4.mp4)

### WEBM

![](https://github.com/elringus/imgit/raw/main/samples/assets/webm.webm)

### AVI

![](https://github.com/elringus/imgit/raw/main/samples/assets/avi.avi)

### MKV

![](https://github.com/elringus/imgit/raw/main/samples/assets/mkv.mkv)

### MOV

![](https://github.com/elringus/imgit/raw/main/samples/assets/mov.mov)

## Merge

<!-- Merge option allows merging multiple assets into one. In this case this will
     make the image display different sources depending on the window width. We're
     also overriding global width threshold for the wider image with the 'width' option. -->
![?width=1200&media=(min-width:800px)](https://github.com/elringus/imgit/raw/main/samples/assets/art-wide.jpg)
![?media=(max-width:799px)&merge](https://github.com/elringus/imgit/raw/main/samples/assets/art-square.jpg)

## YouTube

<!-- When YouTube plugin is installed, will build lazy-loaded picture element with the
     video's thumbnail, which is transformed into embedded iframe player when licked
     Custom video title can be defined via alt spec. -->
![Oahu Hawaii – Island in the Sun](https://www.youtube.com/watch?v=arbuYnJoLtU)

## SVG

<!-- When SVG plugin is installed, will embed content of the svg file into HTML. -->
![](https://github.com/elringus/imgit/raw/main/samples/assets/svg.svg)
