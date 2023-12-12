import { std } from "./platform/index.js";

export { std } from "./platform/index.js";
export { cfg } from "./config/index.js";
export { ctx } from "./context.js";
export { cache } from "./cache.js";

/** Creates specified directory in case it doesn't exist (recursive). */
export async function ensureDir(dir: string): Promise<void> {
    if (!(await std.fs.exists(dir)))
        await std.fs.mkdir(dir);
}

/** Returns extension (without dot) of file with specified path. */
export function getExtension(path: string): string {
    const start = path.lastIndexOf(".") + 1;
    if (start >= path.length) return "";
    return path.substring(start);
}
