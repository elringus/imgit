# GPU Acceleration

Encoding is performed on CPU by default. While ffmpeg uses available CPU instructions to speed up the process, it's still much slower compared to encoding directly on GPU, sometimes in order of magnitude.

Given you have a GPU capable of encoding AV1 (NVIDIA GeForce RTX 450+), specify `av1_nvenc` codec in imgit configuration under encoding options to utilize it. Following sample configuration will make imgit use GPU acceleration when encoding main content files, as well as dense and cover variants:

```js
imgit({
    encode: {
        main: {
            specs: [
                [/^image\/.+/, { ext: "avif", codec: "av1_nvenc" }],
                [/^video\/.+/, { ext: "mp4", codec: "av1_nvenc" }]
            ]
        },
        dense: {
            specs: [
                [/^image\/.+/, { ext: "avif", codec: "av1_nvenc" }]
            ]
        },
        cover: {
            specs: [[/.*/, {
                ext: "avif", select: 0, scale: 0.05, blur: 0.4,
                codec: "av1_nvenc"
            }]]
        }
    },
});
```

Consult NVIDIA docs for available encode options: https://docs.nvidia.com/video-technologies/video-codec-sdk/12.0/ffmpeg-with-nvidia-gpu.
