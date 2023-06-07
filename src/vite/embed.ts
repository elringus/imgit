import * as fs from "node:fs";
import * as afs from "node:fs/promises";
import * as path from "node:path";
import { VitePlugin, ViteConfig } from "./types";
import { EmbedOptions, Embedder, DownloadOptions, defaultEmbedOptions, createDefaultEmbedder } from "embed";

export const EmbedAssets = (embedder?: Embedder, options?: EmbedOptions & DownloadOptions): VitePlugin => {
    const assetsDir = path.resolve(options?.assetsDir ?? defaultEmbedOptions.assetsDir);
    embedder ??= createDefaultEmbedder(options);
    let config: ViteConfig;

    return {
        name: "vite-plugin-embed-remote-media",
        enforce: "pre",
        configResolved: initialize,
        transform,
        transformIndexHtml: async (html, ctx) => (await transform(html, ctx.filename))?.code ?? null
    };

    async function initialize(resolved: ViteConfig) {
        config = resolved;
        if (config.server.force)
            await emptyDir(assetsDir);
        ensureDir(assetsDir);
    }

    async function transform(code: string, id: string) {
        const result = await embedder!.embed(id, code);
        return result == null ? null : {
            code: result.document,
            map: config.build.sourcemap ? result.map : null
        };
    }
};

async function emptyDir(dir: string) {
    for (const file of await afs.readdir(dir))
        fs.unlink(path.join(dir, file), _ => {});
}

function ensureDir(dir: string) {
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
}
