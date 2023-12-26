// @ts-expect-error
import $fs from "node:fs";
// @ts-expect-error
import $afs from "node:fs/promises";
// @ts-expect-error
import $path from "node:path";
// @ts-expect-error
import { promisify } from "node:util";
// @ts-expect-error
import { fileURLToPath } from "node:url";
// @ts-expect-error
import { exec } from "node:child_process";
import { Platform } from "./platform.js";

// https://nodejs.org/api/buffer.html
declare module Buffer {
    const from: (data: Uint8Array) => { toString: (fmt: string) => string };
}

// https://nodejs.org/api/process.html
declare module process {
    const stdout: {
        isTTY?: boolean;
        clearLine: (idx: number) => void;
        cursorTo: (idx: number) => void;
        write: (msg: string) => void;
    };
}

// https://nodejs.org/api/console.html
declare module console {
    const info: (msg: string) => void;
    const warn: (msg: string) => void;
    const error: (msg: string) => void;
}

// https://nodejs.org/api/fs.html
const fs = $fs as {
    existsSync: (path: string) => boolean;
};

// https://nodejs.org/api/fs.html#promises-api
const afs = $afs as {
    stat: (path: string) => Promise<{ size: number }>;
    readFile: (path: string, fmt?: string) => Promise<string | ArrayBufferLike>;
    writeFile: (path: string, content: string | Uint8Array, fmt?: string) => Promise<void>;
    unlink: (path: string) => Promise<void>;
    mkdir: (path: string, options?: { recursive?: boolean }) => Promise<void>;
};

// https://nodejs.org/api/path.html
const path = $path as {
    join: (...parts: string[]) => string;
    resolve: (...parts: string[]) => string;
    relative: (...parts: string[]) => string;
    basename: (path: string) => string;
    dirname: (path: string) => string;
};

export const node: Readonly<Platform> = {
    fs: {
        exists: async path => fs.existsSync(path),
        size: path => afs.stat(path).then(s => s.size),
        read: async (path, encoding) => {
            if (encoding === "utf8") return <never>await afs.readFile(path, "utf-8");
            return <never>new Uint8Array(<ArrayBufferLike>await afs.readFile(path));
        },
        write: (path, content) => {
            if (typeof content === "string") return afs.writeFile(path, content, "utf-8");
            return afs.writeFile(path, content);
        },
        remove: afs.unlink,
        mkdir: (path: string) => afs.mkdir(path, { recursive: true }).then()
    },
    path: {
        join: (...p) => path.join(...p).replaceAll("\\", "/"),
        resolve: (...p) => path.resolve(...p).replaceAll("\\", "/"),
        relative: (from, to) => path.relative(from, to).replaceAll("\\", "/"),
        basename: path.basename,
        dirname: p => path.dirname(p).replaceAll("\\", "/"),
        fileUrlToPath: url => fileURLToPath(url).replaceAll("\\", "/")
    },
    log: {
        tty: msg => {
            if (!process.stdout.isTTY) return;
            process.stdout.clearLine(0);
            process.stdout.cursorTo(0);
            process.stdout.write(msg);
        },
        info: console.info,
        warn: console.warn,
        err: console.error
    },
    exec: async cmd => {
        const execAsync = promisify(exec);
        const { stdout, stderr } = await execAsync(cmd);
        return { out: stdout, err: stderr?.length > 0 ? Error(stderr) : undefined };
    },
    fetch: (url, abort) => fetch(url, { signal: abort }),
    wait: (seconds) => new Promise(resolve => setTimeout(resolve, seconds * 1000)),
    base64: async data => Buffer.from(data).toString("base64")
};
