import { Plugin, PluginInjection, Cache, cache as $cache, std, stages } from "../../server/index.js";
import { BuiltAsset } from "../../server/asset.js";

// Transform bilibili link to embedded iframe.
// https://www.bilibili.com/video/BV1xx411c7mC => https://player.bilibili.com/player.html?isOutside=true&bvid=BV1xx411c7mC

/** BiliBili plugin preferences. */
export type Prefs = {
    /** Whether to show captured alt syntax as video title; enabled by default. */
    title?: boolean;
    /** Whether to show "Watch on BiliBili" banner; enabled by default. */
    banner?: boolean;
}

type BiliCache = Cache & {
    /** Resolved thumbnail URLs mapped by BiliBili video ID. */
    bili: Record<string, string>;
}

/** BiliBili thumbnail variants; each video is supposed to have at least "0". */
const thumbs = ["maxresdefault", "mqdefault", "0"];
const cache = <BiliCache>$cache;
const prefs: Prefs = {};

/** Adds support for embedding BiliBili videos with imgit.
 *  @example
 *  ```md
 *  ![](https://www.bilibili.com/video/BV1xx411c7mC)
 *  ``` */
export default function ($prefs?: Prefs): Plugin {
    if (!cache.hasOwnProperty("bilibili")) cache.bilibili = {};
    Object.assign(prefs, $prefs);
    return { build, inject };
}

function inject(): PluginInjection[] {
    const dir = std.path.dirname(std.path.fileUrlToPath(import.meta.url));
    return [
        { type: "module", src: `${dir}/client.js` },
        { type: "css", src: `${dir}/styles.css` }
    ];
}

async function build(asset: BuiltAsset): Promise<boolean> {
    if (!isBili(asset.syntax.url)) return false;
    const id = getBiliId(asset.syntax.url);
    const title = asset.syntax.alt ?? "";
    const cls = `imgit-bili` + (asset.spec.class ? ` ${asset.spec.class}` : ``);
    const source = `https://player.bilibili.com/player.html?isOutside=true&bvid=${id}`;
    const allow = `accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture`;
    asset.html = `<div class="${cls}" ${stages.build.CONTAINER_ATTR}>`;
    asset.html += buildTitle(title);
    asset.html += buildBanner(asset.syntax.url);
    asset.html += `<div class="imgit-bili-poster" title="Play BiliBili video">`;
    asset.html += `<div class="imgit-bili-play" title="Play BiliBili video"></div>`;
    asset.html += await buildPoster(asset);
    asset.html += `</div><div class="imgit-bili-player" hidden>`;
    asset.html += `<iframe title="${title}" scrolling="no" border="0" frameborder="no" framespacing="0" data-src="${source}" allow="${allow}" allowfullscreen></iframe>`;
    asset.html += `</div></div>`;
    return true;
}

function buildTitle(title: string) {
    if (prefs.title === false || title === "") return "";
    const style = `position:absolute;`; // inlining to prevent layout shift before css applied
    return `<div class="imgit-bili-title" style="${style}">${title}</div>`;
}

function buildBanner(url: string): string {
    if (prefs.banner === false) return "";
    const cls = "imgit-bili-banner";
    const title = "Watch video on BiliBili";
    const style = `position:absolute;`; // inlining to prevent layout shift before css applied
    return `<button class="${cls}" title="${title}" data-href="${url}" style="${style}">Watch on</button>`;
}

async function buildPoster(asset: BuiltAsset): Promise<string> {
    // Reuse default picture build procedure.
    await stages.build.asset(asset);
    return asset.html;
}

/** Whether specified url is a valid BiliBili video link. */
function isBili(url: string): boolean {
    return url.includes("bilibili.com/video/");
}

/** Given valid url to a BiliBili video, extracts video ID. */
function getBiliId(url: string): string {
    var bilibiliRegex = /bilibili\.com\/video\/([\w]+)/i;
    var matches = bilibiliRegex.exec(url);
    if (!matches) return "";
    return matches[0];
}
