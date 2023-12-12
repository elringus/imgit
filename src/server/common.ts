import { std } from "./platform";

export { std } from "./platform";
export { cfg } from "./config";
export { ctx } from "./context";
export { cache } from "./cache";

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
