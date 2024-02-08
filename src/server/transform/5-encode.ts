import { ProbedAsset, EncodedAsset, EncodedContent, ProbedContent, ContentInfo } from "../asset.js";
import { EncodeSpec, EncodeSpecMap } from "../config/index.js";
import { std, cfg, ctx, cache } from "../common.js";
import { ffmpeg } from "../ffmpeg/index.js";

/** Generates optimized versions of the source content files. */
export async function encodeAll(assets: ProbedAsset[]): Promise<EncodedAsset[]> {
    await everythingIsFetched();
    for (const asset of assets)
        if (!(await encodeWithPlugins(<EncodedAsset>asset)))
            await encode(<EncodedAsset>asset);
    return <EncodedAsset[]>assets;
}

/** Encodes asset content with ffmpeg. */
export async function encode(asset: EncodedAsset): Promise<void> {
    await encodeMain(asset.content, asset);
    await encodeSafe(asset.content, asset);
    await encodeDense(asset.content, asset);
    await encodeCover(asset.content, asset);
}

async function encodeWithPlugins(asset: EncodedAsset): Promise<boolean> {
    for (const plugin of cfg.plugins)
        if (plugin.encode && await plugin.encode(asset))
            return true;
    return false;
}

// Bundlers typically process files in parallel, so we end up encoding
// while some files are still downloading; encoding multiple files
// in parallel tend to oversaturate CPU utilization, which degrades fetching.
async function everythingIsFetched(): Promise<void> {
    let size = 0;
    while (size < ctx.fetches.size) {
        size = ctx.fetches.size;
        await Promise.all(ctx.fetches.values());
        await std.wait(0);
    }
}

async function encodeMain(content: EncodedContent, asset: EncodedAsset): Promise<void> {
    const spec = getSpec(cfg.encode.main.specs, content.info.type);
    spec.scale = evalThresholdScale(content.info.width, asset.spec.width, spec.scale);
    content.encoded = buildEncodedPath(content, cfg.encode.main.suffix, spec.ext);
    await encodeContent(`${content.src}@main`, content.local, content.encoded, content.info, spec);
}

async function encodeSafe(content: EncodedContent, asset: EncodedAsset): Promise<void> {
    if (!cfg.encode.safe || isSafe(content.info.type, cfg.encode.safe.types)) return;
    const spec = getSpec(cfg.encode.safe.specs, content.info.type);
    spec.scale = evalThresholdScale(content.info.width, asset.spec.width, spec.scale);
    content.safe = buildEncodedPath(content, cfg.encode.safe.suffix, spec.ext);
    await encodeContent(`${content.src}@safe`, content.local, content.safe, content.info, spec);
}

async function encodeDense(content: EncodedContent, asset: EncodedAsset): Promise<void> {
    if (!cfg.encode.dense || !content.info.type.startsWith("image/")) return;
    const threshold = asset.spec.width ?? cfg.width ?? undefined;
    if (!threshold || content.info.width < threshold * cfg.encode.dense.factor) return;
    const spec = getSpec(cfg.encode.dense.specs, content.info.type);
    content.dense = buildEncodedPath(content, cfg.encode.dense.suffix, spec.ext);
    await encodeContent(`${content.src}@dense`, content.local, content.dense, content.info, spec);
}

async function encodeCover(content: EncodedContent, asset: EncodedAsset): Promise<void> {
    if (cfg.cover === null || !cfg.encode.cover) return;
    const spec = getSpec(cfg.encode.cover.specs, content.info.type);
    spec.scale = evalThresholdScale(content.info.width, asset.spec.width, spec.scale);
    content.cover = buildEncodedPath(content, cfg.encode.cover.suffix, spec.ext);
    await encodeContent(`${content.src}@cover`, content.local, content.cover, content.info, spec);
}

async function encodeContent(key: string, path: string, out: string,
    info: ContentInfo, spec: EncodeSpec, dirty?: boolean): Promise<void> {
    if (!dirty && await cacheValid(key, out, spec)) return;
    if (ctx.encodes.has(key)) return ctx.encodes.get(key)!;
    std.log.tty(`Encoding ${key}`);
    const promise = ffmpeg(path, out, info, spec);
    ctx.encodes.set(key, promise);
    await promise;
    cache.specs[key] = spec;
}

async function cacheValid(key: string, out: string, spec: EncodeSpec): Promise<boolean> {
    return await std.fs.exists(out) &&
        cache.specs.hasOwnProperty(key) &&
        equal(cache.specs[key], spec);
}

function equal(a: EncodeSpec, b: EncodeSpec): boolean {
    return a.codec === b.codec &&
        a.select === b.select &&
        a.scale === b.scale &&
        a.blur === b.blur;
}

function isSafe(type: string, safe: (string | RegExp)[]): boolean {
    for (const regex of safe)
        if (new RegExp(regex).test(type))
            return true;
    return false;
}

function getSpec(specs: EncodeSpecMap, type: string): EncodeSpec {
    for (const [regex, spec] of specs)
        if (new RegExp(regex).test(type))
            return { ...spec };
    throw Error(`Failed to get encoding spec for '${type}'.`);
}

function evalThresholdScale(srcWidth: number, assetThreshold?: number, srcScale?: number): number {
    const threshold = assetThreshold ?? cfg.width ?? undefined;
    const width = (threshold && threshold < srcWidth) ? threshold : srcWidth;
    return (srcScale ?? 1) * (width / srcWidth);
}

function buildEncodedPath(content: ProbedContent, suffix: string, ext: string): string {
    const local = content.src.startsWith("/")
        ? content.local.substring(std.path.resolve(cfg.root).length + 1).replaceAll("/", "-")
        : std.path.basename(content.local);
    suffix ??= "";
    return `${std.path.resolve(cfg.encode.root)}/${local}${suffix}.${ext}`;
}
