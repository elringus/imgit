import { EncodedAsset } from "../server/asset.js";

export default function (credentials: unknown): (path: string, asset: EncodedAsset) => Promise<string> {
    return async (path, asset) => "";
}
