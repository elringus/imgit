import { EncodedAsset, BuiltAsset } from "../asset.js";
import { std, cfg, cache } from "../common.js";

/** Attribute expected on containers of HTML generated for imgit content. */
export const CONTAINER_ATTR = `data-imgit-container`;
/** Attribute expected on HTML elements loaded by imgit. */
export const LOADABLE_ATTR = `data-imgit-loadable`;

// Inlining styles to prevent layout shift before CSS is applied.
/** CSS style applied to container of cover element. */
export const COVER_CONTAINER_STYLE = `display:flex;`;
/** CSS style applied to contained elements, siblings to cover element. */
export const COVER_CONTAINED_STYLE = `width:100%;`;
/** CSS style applied to cover element itself. */
export const COVER_STYLE = `${COVER_CONTAINED_STYLE}margin-left:-100%;`;

/** Builds HTML for the optimized assets to overwrite source syntax. */
export async function buildAll(assets: EncodedAsset[]): Promise<BuiltAsset[]> {
    const merges = new Array<BuiltAsset>;
    for (let i = assets.length - 1; i >= 0; i--)
        if (assets[i].spec?.merge) merges.push(<BuiltAsset>assets[i]);
        else await mergeAndBuild(<BuiltAsset>assets[i], merges);
    return <BuiltAsset[]>assets;
}

/** Default HTML builder for supported asset types (images and video). */
export async function build(asset: BuiltAsset, merges?: BuiltAsset[]): Promise<void> {
    if (asset.content.info.type.startsWith("image/")) return buildPicture(asset, merges);
    if (asset.content.info.type.startsWith("video/")) return buildVideo(asset, merges);
    throw Error(`Failed to build HTML: unknown type (${asset.content.info.type}).`);
}

/** Resolves serve url for content file with specified full path based on configured root option. */
export function resolveSource(path: string) {
    return `/${std.path.relative(cfg.root, std.path.dirname(path))}/${std.path.basename(path)}`;
}

/** Resolves dimensions of the specified asset accounting build preferences and aspect ratio. */
export function resolveSize(asset: BuiltAsset) {
    const info = asset.content.info;
    const threshold = asset.spec.width ?? cfg.width;
    const mod = threshold && info.width > threshold ? threshold / info.width : 1;
    const width = Math.floor(info.width * mod);
    const height = Math.floor(info.height * mod);
    return { width, height };
}

async function mergeAndBuild(asset: BuiltAsset, merges: BuiltAsset[]): Promise<void> {
    for (const merge of merges) merge.html = "";
    if (!(await buildWithPlugins(asset, merges))) await build(asset, merges);
    if (cfg.build === "jsx") asset.html = `<div dangerouslySetInnerHTML={{ __html: \`${asset.html}\` }}/>`;
    merges.length = 0;
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
    asset.html = `<div class="${cls}" style="${COVER_CONTAINER_STYLE}" ${CONTAINER_ATTR}>`;
    asset.html += `<picture style="${COVER_CONTAINED_STYLE}">`;
    asset.html += await buildPictureSources(asset);
    if (merges) for (const merge of merges) if (merge.content)
        asset.html += await buildPictureSources(merge);
    asset.html += `<img ${LOADABLE_ATTR} alt="${asset.syntax.alt}" ${size} ${load}/>`;
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
    // TODO: Resolve actual spec at the encoding stage (https://github.com/elringus/imgit/issues/3)
    const codec = "av01.0.04M.08"; // https://jakearchibald.com/2022/html-codecs-parameter-for-av1
    asset.html = `<div class="${cls}" style="${COVER_CONTAINER_STYLE}" ${CONTAINER_ATTR}>`;
    asset.html += `<div style="${COVER_CONTAINED_STYLE}"><video ${LOADABLE_ATTR} ${videoAttrs} ${size}>`;
    asset.html += `<source data-imgit-src="${encoded}" type="video/mp4; codecs=${codec}"${media}/>`;
    asset.html += `<source data-imgit-src="${safe}"/>`;
    asset.html += `</video></div>`;
    asset.html += await buildCover(asset, size, merges);
    asset.html += `</div>`;
}

async function buildCover(asset: BuiltAsset, size: string, merges?: BuiltAsset[]): Promise<string> {
    if (cfg.cover === null) return "";
    let html = asset.content.cover ? await buildCoverSource(asset, asset.content.cover) : "";
    if (merges) for (const merge of merges) if (merge.content.cover)
        html += await buildCoverSource(merge, merge.content.cover);
    html += `<img src="${cfg.cover ?? "//:0"}" alt="cover" ${size} decoding="sync"/>`;
    return `<picture class="imgit-cover" style="${COVER_STYLE}">${html}</picture>`;
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
    const { width, height } = resolveSize(asset);
    return `width="${width}" height="${height}"`;
}

async function serve(path: string, asset: BuiltAsset): Promise<string> {
    if (cfg.plugins) for (const plugin of cfg.plugins)
        if (plugin.serve) {
            const src = await plugin.serve(path, asset);
            if (src) return src;
        }
    return resolveSource(path);
}
