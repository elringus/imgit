import { EncodedAsset, BuiltAsset } from "../asset.js";
import { std, cfg, cache } from "../common.js";

/** Attribute expected on containers of HTML generated for imgit content. */
export const CONTAINER_ATTR = `data-imgit-container`;
/** Attribute expected on HTML elements loaded by imgit. */
export const LOADABLE_ATTR = `data-imgit-loadable`;
/** CSS style applied to container to stack cover on top of covered element. */
export const CONTAINER_STYLE = `style="display: grid;"`;
/** CSS style applied to contained element to stack cover on top of covered element. */
export const CONTAINED_STYLE = `style="grid-area: 1 / 1; display: flex;"`;
/** CSS style applied to images (both main and covers) to fit into container. */
export const IMG_STYLE = `style="contain: size;"`;

/** Builds HTML for the optimized assets to overwrite source syntax. */
export async function buildAll(assets: EncodedAsset[]): Promise<BuiltAsset[]> {
    const merges = new Array<BuiltAsset>;
    for (let i = assets.length - 1; i >= 0; i--)
        if (assets[i].spec?.merge) merges.push(<BuiltAsset>assets[i]);
        else {
            if (!(await buildWithPlugins(<BuiltAsset>assets[i], merges)))
                await build(<BuiltAsset>assets[i], merges);
            merges.length = 0;
        }
    return <BuiltAsset[]>assets;
}

/** Default HTML builder for supported asset types (images and video). */
export async function build(asset: BuiltAsset, merges?: BuiltAsset[]): Promise<void> {
    if (merges) for (const merge of merges) merge.html = "";
    if (asset.content.info.type.startsWith("image/")) return buildPicture(asset, merges);
    if (asset.content.info.type.startsWith("video/")) return buildVideo(asset, merges);
    throw Error(`Failed to build HTML: unknown type (${asset.content.info.type}).`);
}

/** Builds serve url for content file with specified full path based on configured root option. */
export function buildContentSource(path: string) {
    return `/${std.path.relative(cfg.root, std.path.dirname(path))}/${std.path.basename(path)}`;
}

async function buildWithPlugins(asset: BuiltAsset, merges: BuiltAsset[]): Promise<boolean> {
    for (const plugin of cfg.plugins)
        if (plugin.build && await plugin.build(asset, merges))
            return true;
    return false;
}

async function buildPicture(asset: BuiltAsset, merges?: BuiltAsset[]): Promise<void> {
    const size = buildSizeAttributes(asset);
    const load = asset.spec.eager == null ? `loading="lazy" decoding="async"` : `decoding="sync"`;
    const cls = `imgit-picture` + (asset.spec.class ? ` ${asset.spec.class}` : ``);
    asset.html = `<div class="${cls}" ${CONTAINER_ATTR} ${CONTAINER_STYLE}>`;
    asset.html += `<picture ${CONTAINED_STYLE}>`;
    asset.html += await buildPictureSources(asset);
    if (merges) for (const merge of merges) if (merge.content)
        asset.html += await buildPictureSources(merge);
    asset.html += `<img ${LOADABLE_ATTR} ${IMG_STYLE} alt="${asset.syntax.alt}" ${size} ${load}/>`;
    asset.html += `</picture>`;
    asset.html += await buildCover(asset, size, merges);
    asset.html += `</div>`;
}

async function buildPictureSources(asset: BuiltAsset) {
    const safe = await serve(asset.content.safe ?? asset.content.local, asset);
    const encoded = await serve(asset.content.encoded, asset);
    const dense = asset.content.dense && await serve(asset.content.dense, asset);
    return buildPictureSource(encoded, "image/avif", dense, asset.spec.media) +
        buildPictureSource(safe, undefined, undefined, asset.spec.media);
}

function buildPictureSource(src: string, type?: string, dense?: string, media?: string): string {
    const srcset = `${src} 1x${dense ? `, ${dense} ${cfg.encode.dense!.factor}x` : ""}`;
    const typeAttr = type ? ` type="${type}"` : "";
    const mediaAttr = media ? ` media="${media}"` : "";
    return `<source srcset="${srcset}"${typeAttr}${mediaAttr}/>`;
}

async function buildVideo(asset: BuiltAsset, merges?: BuiltAsset[]): Promise<void> {
    const encoded = await serve(asset.content.encoded, asset);
    const safe = await serve(asset.content.safe ?? asset.content.local, asset);
    const size = buildSizeAttributes(asset);
    const media = asset.spec.media ? ` media="${asset.spec.media}"` : "";
    const cls = `imgit-video` + (asset.spec.class ? ` ${asset.spec.class}` : ``);
    const videoAttrs = `preload="none" loop autoplay muted playsinline`;
    // TODO: Resolve actual spec at the encoding stage.
    const codec = "av01.0.04M.08"; // https://jakearchibald.com/2022/html-codecs-parameter-for-av1
    asset.html = `<div class="${cls}" ${CONTAINER_ATTR} ${CONTAINER_STYLE}>`;
    asset.html += `<video ${LOADABLE_ATTR} ${videoAttrs} ${size} ${CONTAINED_STYLE}>`;
    asset.html += `<source data-imgit-src="${encoded}" type="video/mp4; codecs=${codec}"${media}/>`;
    asset.html += `<source data-imgit-src="${safe}"/>`;
    asset.html += `</video>`;
    asset.html += await buildCover(asset, size, merges);
    asset.html += `</div>`;
}

async function buildCover(asset: BuiltAsset, size: string, merges?: BuiltAsset[]): Promise<string> {
    if (cfg.cover === null) return "";
    let html = asset.content.cover ? await buildCoverSource(asset, asset.content.cover) : "";
    if (merges) for (const merge of merges) if (merge.content.cover)
        html += await buildCoverSource(merge, merge.content.cover);
    html += `<img src="${cfg.cover ?? "//:0"}" alt="cover" ${IMG_STYLE} ${size} decoding="sync"/>`;
    return `<picture class="imgit-cover" ${CONTAINED_STYLE}>${html}</picture>`;
}

async function buildCoverSource(asset: BuiltAsset, path: string): Promise<string> {
    const data = await getCoverData(asset, path);
    const mediaAttr = asset.spec.media ? ` media="${asset.spec.media}"` : "";
    return `<source srcset="${data}" type="image/avif"${mediaAttr}/>`;
}

async function getCoverData(asset: BuiltAsset, path: string): Promise<string> {
    const data = !asset.dirty && cache.covers.hasOwnProperty(asset.syntax.url)
        ? cache.covers[asset.syntax.url]
        : cache.covers[asset.syntax.url] = await std.base64(await std.fs.read(path, "bin"));
    return `data:image/avif;base64,${data}`;
}

function buildSizeAttributes(asset: BuiltAsset): string {
    const info = asset.content.info;
    const threshold = asset.spec.width ?? cfg.width;
    const mod = threshold && info.width > threshold ? threshold / info.width : 1;
    const width = Math.floor(info.width * mod);
    const height = Math.floor(info.height * mod);
    return `width="${width}" height="${height}"`;
}

async function serve(path: string, asset: BuiltAsset): Promise<string> {
    if (cfg.plugins) for (const plugin of cfg.plugins)
        if (plugin.serve) {
            const src = await plugin.serve(path, asset);
            if (src) return src;
        }
    return buildContentSource(path);
}
