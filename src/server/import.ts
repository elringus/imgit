import { stages } from "./transform/index.js";
import { EncodedContent, ContentInfo, BuiltAsset } from "./asset.js";

/** Result of importing asset via imgit. */
export type AssetImport = {
    /** Sources of the asset content. */
    content: EncodedContent;
    /** Content metadata. */
    info: ContentInfo;
}

/** Whether specified import identifier is an imgit asset import. */
export function isImgitAssetImport(importId: string): boolean {
    return importId.startsWith("imgit:");
}

/** Resolves result (source code) of importing an imgit asset. */
export async function importImgitAsset(importId: string): Promise<string> {
    const url = importId.substring(6);
    const asset = <BuiltAsset>{ syntax: { text: "", index: -1, url } };
    stages.resolve.asset(asset);
    await stages.fetch.asset(asset);
    await stages.probe.asset(asset);
    await stages.encode.asset(asset);
    const size = stages.build.size(asset);
    return `export default {
                content: {
                    encoded: ${buildSrc(asset.content.encoded)},
                    dense: ${buildSrc(asset.content.dense)},
                    cover: ${buildSrc(asset.content.cover)},
                    safe: ${buildSrc(asset.content.safe)}
                },
                info: {
                    type: "${asset.content.info.type}",
                    height: ${size.height},
                    width: ${size.width},
                    alpha: ${asset.content.info.alpha}
                }
            }`;
}

function buildSrc(path?: string) {
    if (path === undefined) return "undefined";
    const src = stages.build.source(path);
    return `"${src}"`;
}
