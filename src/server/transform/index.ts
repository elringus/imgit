import * as capture from "./1-capture.js";
import * as resolve from "./2-resolve.js";
import * as fetch from "./3-fetch.js";
import * as probe from "./4-probe.js";
import * as encode from "./5-encode.js";
import * as build from "./6-build.js";
import * as rewrite from "./7-rewrite.js";

/** Individual document transformation stages. */
export const stages = { capture, resolve, fetch, probe, encode, build, rewrite };

/** Transforms source document (eg, <code>.md</code>, <code>.jsx</code> or <code>.html</code>)
 *  with specified content replacing configured asset syntax with optimized HTML.
 *  @param content Text content of the document to transform.
 *  @param id Document's file name or another identifier in the context of build procedure.
 *  @return Transformed content of the document. */
export async function transform(content: string, id?: string): Promise<string> {
    const captured = await capture.captureAll(content, id);
    const resolved = await resolve.resolveAll(captured);
    const fetched = await fetch.fetchAll(resolved);
    const probed = await probe.probeAll(fetched);
    const encoded = await encode.encodeAll(probed);
    const built = await build.buildAll(encoded);
    return rewrite.rewriteAll(content, built, id);
}
