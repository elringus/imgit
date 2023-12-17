import { describe, it, expect, vi, afterEach } from "vitest";
import { Platform, Prefs, boot, exit, defaults } from "../src/server/index.js";
import { captureAll } from "../src/server/transform/1-capture.js";
import { resolveAll } from "../src/server/transform/2-resolve.js";
import { fetchAll } from "../src/server/transform/3-fetch.js";
import { probeAll } from "../src/server/transform/4-probe.js";
import { encodeAll } from "../src/server/transform/5-encode.js";
import { buildAll } from "../src/server/transform/6-build.js";
import { rewriteAll } from "../src/server/transform/7-rewrite.js";

const platform = {
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

afterEach(exit);

describe("capture", () => {
    it("captures markdown syntax by default", async () => {
        await init();
        const assets = await captureAll("", "![alt?spec](url)");
        expect(assets).toHaveLength(1);
        expect(assets[0].syntax).toStrictEqual({
            text: "![alt?spec](url)", index: 0,
            url: "url", alt: "alt", spec: "?spec"
        });
    });

    it("captures syntax with custom regex", async () => {
        await init({ regex: [/<Imgit.*url="(?<url>.+?)".*\/>/g] });
        const assets = await captureAll("", `![](foo)<Imgit url="bar"/>`);
        expect(assets).toHaveLength(1);
        expect(assets[0].syntax).toStrictEqual({
            text: `<Imgit url="bar"/>`, index: 8,
            url: "bar", alt: undefined, spec: undefined
        });
    });

    it("captures syntax with multiple regex", async () => {
        await init({ regex: [/!\[]\((?<url>.+?)\)/g, /<Imgit.*url="(?<url>.+?)".*\/>/g] });
        const assets = await captureAll("", `![](foo)<Imgit url="bar"/>`);
        expect(assets).toHaveLength(2);
        expect(assets[0].syntax).toStrictEqual({
            text: `![](foo)`, index: 0,
            url: "foo", alt: undefined, spec: undefined
        });
        expect(assets[1].syntax).toStrictEqual({
            text: `<Imgit url="bar"/>`, index: 8,
            url: "bar", alt: undefined, spec: undefined
        });
    });

    it("compatible plugin overrides built-in behaviour", async () => {
        await init({ plugins: [{ capture: () => true }] });
        const assets = await captureAll("", "![](url)");
        expect(assets).toHaveLength(0);
    });

    it("incompatible plugins don't override built-in behaviour", async () => {
        await init({ plugins: [{}, { capture: () => false }] });
        const assets = await captureAll("", "![](url)");
        expect(assets).toHaveLength(1);
    });
});

async function init(prefs?: Prefs): Promise<void> {
    return boot({ ...defaults, ...(prefs ?? []) }, platform);
}
