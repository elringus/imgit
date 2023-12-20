import { Options, EncodeSpecMap } from "./options.js";

/** Default build server configuration. */
export const defaults = createDefaults();

/** Creates default build server configuration. */
export function createDefaults(): Readonly<Options> {
    return {
        root: "./public",
        regex: [/!\[(?<alt>.*?)(?<spec>\?\S+?)?]\((?<url>.+?)\)/g],
        width: null,
        cache: { root: "./node_modules/.cache/imgit" },
        fetch: {
            root: "./node_modules/.cache/imgit/fetched",
            timeout: 30, retries: 3, delay: 6
        },
        encode: {
            root: "./node_modules/.cache/imgit/encoded",
            main: {
                suffix: "@main",
                specs: [
                    // https://trac.ffmpeg.org/wiki/Encode/AV1#libaom
                    [/^image\/(?:gif|apng)$/, { ext: "avif", codec: "libaom-av1 -crf 23 -cpu-used 5" }],
                    [/^image\/.+/, { ext: "avif", codec: "libaom-av1 -still-picture 1 -crf 23 -cpu-used 5" }],
                    [/^video\/.+/, { ext: "mp4", codec: "libaom-av1 -crf 45 -cpu-used 5" }]
                ]
            },
            dense: {
                suffix: "@dense",
                factor: 2,
                specs: [
                    [/^image\/(?:gif|apng)$/, { ext: "avif", codec: "libaom-av1 -crf 23 -cpu-used 5" }],
                    [/^image\/.+/, { ext: "avif", codec: "libaom-av1 -still-picture 1 -crf 23 -cpu-used 5" }]
                ]
            },
            cover: {
                suffix: "@cover",
                specs: [[/.*/, {
                    ext: "avif", select: 0, scale: 0.05, blur: 0.4,
                    codec: "libaom-av1 -still-picture 1 -crf 23 -cpu-used 5"
                }]]
            },
            safe: {
                suffix: "@safe",
                types: [
                    /^image\/(?:png|jpeg|webp|gif|apng)$/,
                    /^video\/(?:mp4|webm)$/
                ],
                specs: [
                    [/^image\/.+/, { ext: "webp" }],
                    [/^video\/.+/, { ext: "webm" }]
                ]
            }
        },
        plugins: []
    };
}
