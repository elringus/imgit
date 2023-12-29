import { vi } from "vitest";
import { Platform, Prefs, exit, cache, boot as bootServer } from "../../src/server/index.js";
import { createDefaults } from "../../src/server/config/index.js";
import { BuiltAsset } from "../../src/server/asset.js";

export const std = {
    fs: {
        exists: vi.fn(),
        size: vi.fn(),
        read: vi.fn(),
        write: vi.fn(),
        remove: vi.fn(),
        mkdir: vi.fn()
    },
    path: {
        join: vi.fn(),
        resolve: vi.fn(),
        relative: vi.fn(),
        basename: vi.fn(),
        dirname: vi.fn(),
        fileUrlToPath: vi.fn()
    },
    log: {
        tty: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        err: vi.fn()
    },
    exec: vi.fn(),
    fetch: vi.fn(),
    wait: vi.fn(),
    base64: vi.fn()
} satisfies Platform;

export let defs: Readonly<Prefs>;
export let asset: BuiltAsset;

export function setup() {
    defs = createDefaults();
    asset = {
        syntax: { text: "", index: 0, url: "" },
        spec: {},
        dirty: false,
        content: { src: "", local: "", info: { type: "", alpha: false, height: 0, width: 0 }, encoded: "" },
        html: ""
    };
    for (const prop of Object.getOwnPropertyNames(cache))
        cache[prop] = {};
}

export async function tear() {
    await exit();
    vi.resetAllMocks();
}

export async function boot(prefs?: Prefs): Promise<void> {
    await bootServer(prefs, std);
}
