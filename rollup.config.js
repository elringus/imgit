import ts from "@rollup/plugin-typescript";

const external = [
    "axios",
    "magic-string",
    "ffprobe",
    "ffprobe-static",
    "node:fs",
    "node:fs/promises",
    "node:path",
    "node:crypto",
    "node:util"
];

const config = [
    {
        input: "dist/types/index.js",
        output: { file: "dist/stopka.js", format: "cjs", sourcemap: true },
        plugins: [ts()],
        external
    },
    {
        input: "dist/types/index.js",
        output: { file: "dist/stopka.mjs", format: "esm", sourcemap: true },
        plugins: [ts()],
        external
    }
];

// noinspection JSUnusedGlobalSymbols
export default config;
