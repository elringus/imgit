import dts from "rollup-plugin-dts";
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
        input: "build/index.js",
        output: { file: "dist/stopka.js", format: "cjs", sourcemap: true },
        plugins: [ts()],
        external
    },
    {
        input: "build/index.js",
        output: { file: "dist/stopka.mjs", format: "esm", sourcemap: true },
        plugins: [ts()],
        external
    },
    {
        input: "build/index.d.ts",
        output: { file: "dist/stopka.d.ts", format: "es" },
        plugins: [dts()]
    }
];

// noinspection JSUnusedGlobalSymbols
export default config;
