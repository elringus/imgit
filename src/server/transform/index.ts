import { captureAll, capture } from "./1-capture.js";
import { resolveAll, resolve, resolveSpec } from "./2-resolve.js";
import { fetchAll, fetch } from "./3-fetch.js";
import { probeAll, probe } from "./4-probe.js";
import { encodeAll, encode } from "./5-encode.js";
import { buildAll, build, resolveSource, CONTAINER_ATTR, resolveSize } from "./6-build.js";
import { rewriteAll, rewrite } from "./7-rewrite.js";

/** Individual document transformation stages. */
export const stages = {
    capture: { assets: capture },
    resolve: { asset: resolve, spec: resolveSpec },
    fetch: { asset: fetch },
    probe: { asset: probe },
    encode: { asset: encode },
    build: { asset: build, source: resolveSource, size: resolveSize, CONTAINER_ATTR },
    rewrite: { content: rewrite }
};

/** Transforms source document (eg, `.md`, `.jsx` or `.html`)
 *  with specified content replacing configured asset syntax with optimized HTML.
 *  @param content Text content of the document to transform.
 *  @param id Document's file name or another identifier in the context of build procedure.
 *  @return Transformed content of the document. */
export async function transform(content: string, id?: string): Promise<string> {
    const captured = await captureAll(content, id);
    const resolved = await resolveAll(captured);
    const fetched = await fetchAll(resolved);
    const probed = await probeAll(fetched);
    const encoded = await encodeAll(probed);
    const built = await buildAll(encoded);
    return rewriteAll(content, built, id);
}
