import { BuiltAsset } from "../asset.js";
import { cfg } from "../common.js";

/** Rewrites content of the document with specified assets; returns modified document content. */
export async function rewriteAll(content: string, assets: BuiltAsset[], id?: string): Promise<string> {
    return (await rewriteWithPlugins(content, assets, id)) ?? rewrite(content, assets);
}

/** Default rewrite procedure. */
export function rewrite(content: string, assets: BuiltAsset[]): string {
    const replaced = new Set<string>;
    for (const asset of assets)
        content = rewriteAsset(asset, content, replaced);
    return content;
}

function rewriteAsset(asset: BuiltAsset, content: string, replaced: Set<string>): string {
    if (replaced.has(asset.syntax.text)) return content;
    replaced.add(asset.syntax.text);
    return content.replaceAll(asset.syntax.text, asset.html);
}

async function rewriteWithPlugins(content: string, assets: BuiltAsset[], id?: string): Promise<string | null> {
    for (const plugin of cfg.plugins)
        if (plugin.rewrite) {
            const result = await plugin.rewrite(content, assets, id);
            if (result !== null) return result;
        }
    return null;
}
