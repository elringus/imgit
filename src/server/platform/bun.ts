// @ts-expect-error (platform-specific)
import $afs from "node:fs/promises";
// @ts-expect-error (platform-specific)
import $path from "node:path";
import type { Platform } from "./platform.js";

// https://github.com/oven-sh/bun/tree/main/packages/bun-types
declare module Bun {
    const file: (path: string) => {
        exists: () => Promise<boolean>;
        arrayBuffer: () => Promise<ArrayBuffer>;
        text: () => Promise<string>;
    };
    const fileURLToPath: (url: string) => string;
    const write: (path: string, content: string | Uint8Array) => Promise<number>;
    const spawn: (cmd: string[]) => {
        exited: Promise<void>;
        exitCode: number;
        stdout: ArrayBuffer;
        stderr: ArrayBuffer;
    };
}

// Bun shim for https://nodejs.org/api/buffer.html
declare module Buffer {
    const from: (data: Uint8Array) => { toString: (fmt: string) => string };
}

// Bun shim for https://nodejs.org/api/process.html
declare module process {
    const stdout: {
        isTTY?: boolean;
        clearLine: (idx: number) => void;
        cursorTo: (idx: number) => void;
        write: (msg: string) => void;
    };
}

// Bun shim for: https://nodejs.org/api/console.html
declare module console {
    const info: (msg: string) => void;
    const warn: (msg: string) => void;
    const error: (msg: string) => void;
}

// Bun shim for https://nodejs.org/api/fs.html#promises-api
const afs = $afs as {
    stat: (path: string) => Promise<{ size: number }>;
    unlink: (path: string) => Promise<void>;
    mkdir: (path: string, options?: { recursive?: boolean }) => Promise<void>;
};

// Bun shim for https://nodejs.org/api/path.html
const path = $path as {
    join: (...parts: string[]) => string;
    resolve: (...parts: string[]) => string;
    relative: (...parts: string[]) => string;
    basename: (path: string) => string;
    dirname: (path: string) => string;
};

export const bun: Readonly<Platform> = {
    fs: {
        exists: path => Bun.file(path).exists(),
        size: path => afs.stat(path).then(s => s.size),
        read: async (path, encoding) => {
            const file = Bun.file(path);
            if (encoding === "utf8") return <never>await file.text();
            return <never>new Uint8Array(await file.arrayBuffer());
        },
        write: async (path, content) => {
            if (typeof content === "string") return Bun.write(path, content).then();
            return Bun.write(path, content).then();
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
        fileUrlToPath: url => Bun.fileURLToPath(url).replaceAll("\\", "/")
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
        const proc = Bun.spawn(cmd.split(" "));
        await proc.exited;
        const failed = proc.exitCode !== 0;
        const out = await new Response(proc.stdout).text();
        const err = failed ? Error(await new Response(proc.stderr).text()) : undefined;
        return { out, err };
    },
    fetch: (url, abort) => fetch(url, { signal: abort }),
    wait: (seconds) => new Promise(resolve => setTimeout(resolve, seconds * 1000)),
    base64: async data => Buffer.from(data).toString("base64")
};
