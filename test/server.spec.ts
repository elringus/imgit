import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Platform, Prefs, boot, exit, defaults, cache, ctx } from "../src/server/index.js";
import { BuiltAsset } from "../src/server/asset.js";
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

let asset: BuiltAsset;

beforeEach(() => {
    vi.resetAllMocks();
    for (const prop of Object.getOwnPropertyNames(cache))
        cache[prop] = {};
    asset = {
        syntax: { text: "", index: 0, url: "" },
        spec: {},
        dirty: false,
        content: { src: "", local: "", info: { type: "", alpha: false, height: 0, width: 0 }, encoded: "" },
        html: ""
    };
});

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

describe("resolve", () => {
    it("resolves content src as syntax url", async () => {
        await init();
        const assets = await resolveAll([{ ...asset, syntax: { ...asset.syntax, url: "foo" } }]);
        expect(assets[0].content.src).toStrictEqual("foo");
    });

    it("resolves spec to empty object when syntax spec is undefined", async () => {
        await init();
        const assets = await resolveAll([{ ...asset, syntax: { ...asset.syntax, spec: undefined } }]);
        expect(assets[0].spec).toStrictEqual({});
    });

    it("parses captured spec syntax as URL query", async () => {
        await init();
        const spec = `?width=1&eager&merge&media=(foo)&class=bar`;
        const assets = await resolveAll([{ ...asset, syntax: { ...asset.syntax, spec } }]);
        expect(assets[0].spec).toStrictEqual({
            eager: true, merge: true, width: 1,
            media: "(foo)", class: "bar"
        });
    });

    it("resolves spec options to undefined when URL query is missing associated params", async () => {
        await init();
        const assets = await resolveAll([{ ...asset, syntax: { ...asset.syntax, spec: "?" } }]);
        expect(assets[0].spec).toStrictEqual({
            eager: undefined, merge: undefined, width: undefined,
            media: undefined, class: undefined
        });
    });

    it("compatible plugin overrides built-in behaviour", async () => {
        await init({ plugins: [{ resolve: () => true }] });
        const spy = vi.spyOn(asset, "content", "set");
        await resolveAll([asset]);
        expect(spy).not.toBeCalled();
    });

    it("incompatible plugins don't override built-in behaviour", async () => {
        await init({ plugins: [{}, { resolve: () => false }] });
        const spy = vi.spyOn(asset, "content", "set");
        await resolveAll([asset]);
        expect(spy).toBeCalled();
    });
});

describe("fetch", () => {
    beforeEach(() => {
        platform.fetch.mockReturnValue(<never>Promise.resolve({
            status: 200,
            arrayBuffer: () => Promise.resolve(new ArrayBuffer(0))
        } satisfies Partial<Response>));
    });

    it("resolves local path from configured root for assets with relative src", async () => {
        await init({ root: "./root" });
        platform.path.resolve.mockImplementation(p => p === "./root" ? "root" : "");
        asset.content.src = "/baz.png";
        await fetchAll([asset]);
        expect(asset.content.local).toStrictEqual("root/baz.png");
    });

    it("resolves local path from configured fetch root for assets with absolute src", async () => {
        await init({ fetch: { root: "./fetched" } });
        platform.path.resolve.mockImplementation(p => p === "./fetched" ? "fetched" : "");
        asset.content.src = "http://host.name/dir/file.ext";
        await fetchAll([asset]);
        expect(asset.content.local).toStrictEqual("fetched/host.name-dir-file.ext");
    });

    it("assumes asset dirty when local file doesn't exist", async () => {
        await init();
        asset.content.src = "http://foo.bar/baz.png";
        platform.fs.exists.mockReturnValue(Promise.resolve(false));
        await fetchAll([asset]);
        expect(asset.dirty).toBeTruthy();
    });

    it("assumes asset dirty when local file exist, but sizes cache record is missing", async () => {
        await init();
        asset.content.src = "http://foo.bar/baz.png";
        platform.fs.exists.mockReturnValue(Promise.resolve(true));
        delete cache.sizes[asset.content.src];
        await fetchAll([asset]);
        expect(asset.dirty).toBeTruthy();
    });

    it("assumes asset dirty when local file exist and size cached, but actual size differs", async () => {
        await init();
        asset.content.src = "http://foo.bar/baz.png";
        platform.fs.exists.mockReturnValue(Promise.resolve(true));
        cache.sizes[asset.content.src] = 1;
        platform.fs.size.mockReturnValue(Promise.resolve(2));
        await fetchAll([asset]);
        expect(asset.dirty).toBeTruthy();
    });

    it("assumes asset not dirty when local file exist and cached size is actual", async () => {
        await init();
        asset.content.src = "http://foo.bar/baz.png";
        platform.fs.exists.mockReturnValue(Promise.resolve(true));
        cache.sizes[asset.content.src] = 1;
        platform.fs.size.mockReturnValue(Promise.resolve(1));
        await fetchAll([asset]);
        expect(asset.dirty).toBeFalsy();
    });

    it("doesn't fetch assets that are not dirty", async () => {
        await init();
        asset.content.src = "http://foo.bar/baz.png";
        platform.fs.exists.mockReturnValue(Promise.resolve(true));
        cache.sizes[asset.content.src] = 1;
        platform.fs.size.mockReturnValue(Promise.resolve(1));
        await fetchAll([asset]);
        expect(platform.fetch).not.toBeCalled();
    });

    it("doesn't fetch assets with local src", async () => {
        await init();
        asset.content.src = "/foo.png";
        await fetchAll([asset]);
        expect(platform.fetch).not.toBeCalled();
    });

    it("reuses fetches with same src", async () => {
        await init();
        ctx.fetches.set("http://foo.bar/baz.png", Promise.resolve());
        asset.content.src = "http://foo.bar/baz.png";
        asset.dirty = true;
        await fetchAll([asset]);
        expect(platform.fetch).not.toBeCalled();
    });

    it("stores fetch promise in context", async () => {
        await init();
        asset.content.src = "http://foo.bar/baz.png";
        await fetchAll([asset]);
        expect(ctx.fetches.has(asset.content.src)).toBeTruthy();
    });

    it("creates dir for downloaded file when necessary", async () => {
        await init();
        asset.content.src = "http://foo.bar/baz.png";
        platform.path.dirname.mockReturnValue("foo");
        await fetchAll([asset]);
        expect(platform.fs.mkdir).toBeCalledWith("foo");
    });

    it("writes downloaded file to fetch root dir", async () => {
        await init();
        platform.path.resolve.mockReturnValue("root");
        asset.content.src = "http://host.name/file.png";
        await fetchAll([asset]);
        expect(platform.fs.write).toBeCalledWith("root/host.name-file.png", expect.anything());
    });

    it("caches fetched file size", async () => {
        await init();
        asset.content.src = "http://foo.bar/baz.png";
        platform.fs.size.mockReturnValue(Promise.resolve(7));
        await fetchAll([asset]);
        expect(cache.sizes[asset.content.src]).toStrictEqual(7);
    });

    it("retries failed fetches up to the limit specified in config, then throws", async () => {
        await init({ fetch: { retries: 2 } });
        asset.content.src = "http://host.name/file.png";
        platform.fetch.mockReturnValue(Promise.reject("foo"));
        await expect(fetchAll([asset])).rejects.toThrow("foo");
        expect(platform.fetch).toHaveBeenCalledTimes(3);
    });

    it("compatible plugin overrides built-in behaviour", async () => {
        await init({ plugins: [{ fetch: () => true }] });
        const spy = vi.spyOn(asset.content, "local", "set");
        await fetchAll([asset]);
        expect(spy).not.toBeCalled();
    });

    it("incompatible plugins don't override built-in behaviour", async () => {
        await init({ plugins: [{}, { fetch: () => false }] });
        asset.content.src = "/";
        const spy = vi.spyOn(asset.content, "local", "set");
        await fetchAll([asset]);
        expect(spy).toBeCalled();
    });
});

async function init(prefs?: Prefs): Promise<void> {
    return boot({ ...defaults, ...(prefs ?? []) }, platform);
}
