import { std, ensureDir } from "./common.js";
import { ContentInfo } from "./asset.js";
import { EncodeSpec } from "./config/index.js";

/** Cached results of the build operations. Each property is persisted as a
 *  standalone JSON file between build runs. Custom properties can be added. */
export type Cache = Record<string, unknown> & {
    /** Sizes of the asset source content in bytes, mapped by content URL. */
    sizes: Record<string, number>;
    /** Results of the asset source content probing, mapped by content URL. */
    probes: Record<string, ContentInfo>;
    /** Encode specifications used for the last encode pass, mapped by content URL. */
    specs: Record<string, EncodeSpec>;
    /** Base64-encoded generated cover images mapped by asset's syntax URL. */
    covers: Record<string, string>;
};

/** Default initial cache state. */
export const empty: Readonly<Cache> = { sizes: {}, probes: {}, specs: {}, covers: {} };
/** Cached results of the build operations. */
export const cache: Cache = empty;

/** Persists specified cache instance for consequent runs. */
export async function save(cache: Cache, root: string): Promise<void> {
    await ensureDir(root);
    for (const prop of Object.getOwnPropertyNames(cache)) {
        const filepath = buildCacheFilePath(prop, root);
        await write(filepath, (<Record<string, unknown>>cache)[prop]);
    }
}

/** Loads cache instance of a previous run. */
export async function load(root: string): Promise<Cache> {
    const cache: Cache = empty;
    for (const prop of Object.getOwnPropertyNames(cache)) {
        const filepath = buildCacheFilePath(prop, root);
        if (await std.fs.exists(filepath))
            (<Record<string, unknown>>cache)[prop] = await read(filepath);
    }
    return cache;
}

async function read(filepath: string) {
    return JSON.parse(await std.fs.read(filepath, "utf8"));
}

function write(filepath: string, object: unknown) {
    return std.fs.write(filepath, JSON.stringify(object));
}

function buildCacheFilePath(prop: string, root: string) {
    return std.path.join(root, `${prop}.json`);
}
