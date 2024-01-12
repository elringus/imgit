import { CapturedAsset, AssetSyntax } from "../asset.js";
import { cfg } from "../common.js";

/** Finds assets to transform in the document with specified content. */
export async function captureAll(content: string, id?: string): Promise<CapturedAsset[]> {
    const assets = new Array<CapturedAsset>;
    if (await captureWithPlugins(content, assets, id)) return assets;
    capture(content, assets);
    return assets;
}

/** Uses regexp defined in options to capture the assets syntax. */
export function capture(content: string, assets: CapturedAsset[]) {
    for (const regex of cfg.regex.map(r => new RegExp(r)))
        for (const match of content.matchAll(regex))
            if (match.groups) assets.push({ syntax: createSyntax(match) });
}

function createSyntax(match: RegExpMatchArray): AssetSyntax {
    return {
        text: match[0],
        index: match.index!,
        url: match.groups!.url,
        alt: match.groups!.alt,
        spec: match.groups!.spec
    };
}

async function captureWithPlugins(content: string, assets: CapturedAsset[], id?: string): Promise<boolean> {
    for (const plugin of cfg.plugins)
        if (plugin.capture && await plugin.capture(content, assets, id))
            return true;
    return false;
}
