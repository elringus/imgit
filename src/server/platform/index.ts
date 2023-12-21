/* v8 ignore start */

import { Platform } from "./platform.js";
export { Platform } from "./platform.js";

/** Platform-specific APIs. */
export const std: Readonly<Platform> = <never>{};

/** Binds platform APIs or attempts to auto-detect when not specified. */
export async function bind(api?: Platform) {
    api ??= await detect();
    for (const prop of Object.getOwnPropertyNames(api))
        (<Record<string, unknown>>std)[prop] = api[prop];
}

async function detect(): Promise<Platform> {
    // TODO: Bundlers choke on deno's url imports.
    // if (typeof Deno !== "undefined") return (await import("./deno")).deno;
    if (typeof process === "object" && "versions" in process) {
        if (process.versions.bun) return (await import("./bun.js")).bun;
        if (process.versions.node) return (await import("./node.js")).node;
    }
    throw Error("Failed to detect JavaScript runtime; specify 'platform' via plugin parameter.");
}

declare module process {
    const versions: {
        bun?: boolean;
        node?: boolean;
    };
}
