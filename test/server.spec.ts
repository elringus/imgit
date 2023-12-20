﻿import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Platform, Prefs, boot, exit, cache, ctx, cfg } from "../src/server/index.js";
import { createDefaults } from "../src/server/config/index.js";
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

let defs: Readonly<Prefs>;
let asset: BuiltAsset;

beforeEach(() => {
    vi.resetAllMocks();
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
});

afterEach(exit);

describe("meta", () => {
    it("configures in init", async () => {
        await init({ root: "public", cover: null, encode: { ...defs.encode, cover: null } });
        expect(cfg.root).toStrictEqual("public");
        expect(cfg.cover).toBeNull();
        expect(cfg.encode.cover).toBeNull();
    });

    it("doesn't leak config between runs", async () => {
        await init();
        expect(cfg.root).not.toStrictEqual("public");
        expect(cfg.cover).not.toBeNull();
        expect(cfg.encode.cover).not.toBeNull();
    });
});

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
        asset.content.src = "http://host.name/file.png";
        platform.fs.exists.mockReturnValue(Promise.resolve(false));
        await fetchAll([asset]);
        expect(asset.dirty).toBeTruthy();
    });

    it("assumes asset dirty when local file exist, but sizes cache record is missing", async () => {
        await init();
        asset.content.src = "http://host.name/file.png";
        platform.fs.exists.mockReturnValue(Promise.resolve(true));
        delete cache.sizes[asset.content.src];
        await fetchAll([asset]);
        expect(asset.dirty).toBeTruthy();
    });

    it("assumes asset dirty when local file exist and size cached, but actual size differs", async () => {
        await init();
        asset.content.src = "http://host.name/file.png";
        platform.fs.exists.mockReturnValue(Promise.resolve(true));
        cache.sizes[asset.content.src] = 1;
        platform.fs.size.mockReturnValue(Promise.resolve(2));
        await fetchAll([asset]);
        expect(asset.dirty).toBeTruthy();
    });

    it("assumes asset not dirty when local file exist and cached size is actual", async () => {
        await init();
        asset.content.src = "http://host.name/file.png";
        platform.fs.exists.mockReturnValue(Promise.resolve(true));
        cache.sizes[asset.content.src] = 1;
        platform.fs.size.mockReturnValue(Promise.resolve(1));
        await fetchAll([asset]);
        expect(asset.dirty).toBeFalsy();
    });

    it("doesn't fetch assets that are not dirty", async () => {
        await init();
        asset.content.src = "http://host.name/file.png";
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
        ctx.fetches.set("http://host.name/file.png", Promise.resolve());
        asset.content.src = "http://host.name/file.png";
        asset.dirty = true;
        await fetchAll([asset]);
        expect(platform.fetch).not.toBeCalled();
    });

    it("stores fetch promise in context", async () => {
        await init();
        asset.content.src = "http://host.name/file.png";
        await fetchAll([asset]);
        expect(ctx.fetches.has(asset.content.src)).toBeTruthy();
    });

    it("creates dir for downloaded file when necessary", async () => {
        await init();
        asset.content.src = "http://host.name/file.png";
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
        asset.content.src = "http://host.name/file.png";
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

    it("handles retry response", async () => {
        await init();
        asset.content.src = "http://host.name/file.png";
        platform.fetch.mockReturnValueOnce(<never>Promise.resolve({
            status: 429,
            headers: <never>new Map([["retry-after", "10"]])
        } satisfies Partial<Response>));
        await fetchAll([asset]);
        expect(platform.wait).toBeCalledWith(10);
        expect(platform.fetch).toHaveBeenCalledTimes(2);
    });

    it("throws when retry response misses retry-after header", async () => {
        await init({ fetch: { retries: 0 } });
        asset.content.src = "http://host.name/file.png";
        platform.fetch.mockReturnValueOnce(<never>Promise.resolve({
            status: 429,
            headers: <never>new Map([])
        } satisfies Partial<Response>));
        await expect(fetchAll([asset])).rejects.toThrow(/429 without retry-after header/);
    });

    it("throws when retry response's retry-after header is not a number", async () => {
        await init({ fetch: { retries: 0 } });
        asset.content.src = "http://host.name/file.png";
        platform.fetch.mockReturnValueOnce(<never>Promise.resolve({
            status: 429,
            headers: <never>new Map([["retry-after", "later"]])
        } satisfies Partial<Response>));
        await expect(fetchAll([asset])).rejects.toThrow(/429 without retry-after header/);
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

describe("probe", () => {
    beforeEach(() => {
        platform.exec.mockReturnValue(Promise.resolve({ out: "0,0,rgb" }));
    });

    it("parses width, height and alpha separated with comma and type from local path", async () => {
        await init();
        platform.exec.mockReturnValue(Promise.resolve({ out: "1,2,argb" }));
        asset.content.local = "foo.png";
        await probeAll([asset]);
        expect(asset.content.info).toStrictEqual({ width: 1, height: 2, alpha: true, type: "image/png" });
    });

    it("assumes type is unknown when local file has unknown extension", async () => {
        await init();
        platform.exec.mockReturnValue(Promise.resolve({ out: "1,2,rgb" }));
        asset.content.local = "foo.bar";
        await probeAll([asset]);
        expect(asset.content.info).toStrictEqual({ width: 1, height: 2, alpha: false, type: "unknown" });
    });

    it("logs ffprobe error", async () => {
        await init();
        platform.exec.mockReturnValue(Promise.resolve({ out: ",,", err: Error("foo") }));
        await probeAll([asset]);
        expect(platform.log.err).toBeCalledWith("ffprobe error: foo");
    });

    it("uses cached probe result when asset is not dirty", async () => {
        await init();
        const result = { width: 1, height: 2, alpha: true, type: "bar" };
        asset.dirty = false;
        asset.content.src = "foo";
        cache.probes["foo"] = result;
        await probeAll([asset]);
        expect(asset.content.info).toStrictEqual(result);
        expect(platform.exec).not.toBeCalled();
    });

    it("reuses existing probe result with the same src", async () => {
        await init();
        const result = { width: 1, height: 2, alpha: true, type: "bar" };
        asset.content.src = "foo";
        ctx.probes.set("foo", Promise.resolve(result));
        await probeAll([asset]);
        expect(asset.content.info).toStrictEqual(result);
        expect(platform.exec).not.toBeCalled();
    });

    it("compatible plugin overrides built-in behaviour", async () => {
        await init({ plugins: [{ probe: () => true }] });
        const spy = vi.spyOn(asset.content, "info", "set");
        await probeAll([asset]);
        expect(spy).not.toBeCalled();
    });

    it("incompatible plugins don't override built-in behaviour", async () => {
        await init({ plugins: [{}, { probe: () => false }] });
        asset.content.src = "/";
        const spy = vi.spyOn(asset.content, "info", "set");
        await probeAll([asset]);
        expect(spy).toBeCalled();
    });
});

describe("encode", () => {
    beforeEach(() => {
        platform.exec.mockReturnValue(Promise.resolve({ out: "" }));
        asset.content.info = { width: 1, height: 1, type: "image/png" };
        platform.path.resolve = vi.fn(p => p);
    });

    it("waits for for all fetches to complete before encoding", async () => {
        await init();
        ctx.fetches.set("/1.png", Promise.resolve());
        platform.wait.mockImplementationOnce(() => {
            ctx.fetches.set("/2.png", Promise.resolve());
            return Promise.resolve();
        });
        await encodeAll([asset]);
        expect(platform.wait).toBeCalledTimes(2);
    });

    it("throws when can't get spec for encoded content type", async () => {
        await init();
        asset.content.info.type = "foo";
        await expect(encodeAll([asset])).rejects.toThrow(/Failed to get encoding spec/);
    });

    it("encodes to avif when content type is image", async () => {
        await init({ root: "public", encode: { root: "public/encoded" } });
        asset.content.src = "/assets/file.png";
        asset.content.local = "public/assets/file.png";
        asset.content.info.type = "image/png";
        await encodeAll([asset]);
        expect(asset.content.encoded).toStrictEqual("public/encoded/assets-file.png@main.avif");
    });

    it("encodes to mp4 (with av1 codec) when content type is video", async () => {
        await init({ encode: { root: "public/encoded" } });
        asset.content.src = "http://host.name/file.webm";
        asset.content.local = "fetched/host.name-file.webm";
        platform.path.basename.mockReturnValue("host.name-file.webm");
        asset.content.info.type = "video/webm";
        await encodeAll([asset]);
        expect(asset.content.encoded).toStrictEqual("public/encoded/host.name-file.webm@main.mp4");
    });

    it("scales down to specified global width threshold when content width is larger", async () => {
        await init({ root: "public", width: 1, encode: { root: "public/encoded" } });
        asset.content.src = "/assets/file.png";
        asset.content.local = "public/assets/file.png";
        asset.content.info.type = "image/png";
        asset.content.info.width = 10;
        await encodeAll([asset]);
        expect(platform.exec).toBeCalledWith(expect.stringContaining("scale=iw*0.1"));
    });

    it("scales down to specified asset width threshold when content width is larger", async () => {
        await init({ root: "public", encode: { root: "public/encoded" } });
        asset.content.src = "/assets/file.png";
        asset.content.local = "public/assets/file.png";
        asset.content.info.type = "image/png";
        asset.content.info.width = 10;
        asset.spec.width = 5;
        await encodeAll([asset]);
        expect(platform.exec).toBeCalledWith(expect.stringContaining("scale=iw*0.5"));
    });

    it("respects encode spec scaling when resolving scale factor for width threshold", async () => {
        await init({
            root: "public",
            width: 1,
            encode: {
                root: "public/encoded",
                main: { suffix: "", specs: [[/./, { ext: "", scale: 0.1 }]] }
            }
        });
        asset.content.src = "/assets/file.png";
        asset.content.local = "public/assets/file.png";
        asset.content.info.type = "image/png";
        asset.content.info.width = 10;
        asset.spec.width = 10;
        await encodeAll([asset]);
        expect(platform.exec).toBeCalledWith(expect.stringContaining("scale=iw*0.1"));
    });

    it("skips encoding when asset is not dirty, encoded file exist and spec cache is valid", async () => {
        await init({
            root: "public",
            encode: {
                root: "public/encoded",
                main: { suffix: "", specs: [[/./, { ext: "", codec: "foo" }]] },
                cover: { suffix: "", specs: [[/./, { ext: "", codec: "bar", scale: 0.5, select: 0, blur: 1 }]] }
            }
        });
        asset.content.src = "/file.png";
        asset.content.info.type = "image/png";
        asset.dirty = false;
        platform.fs.exists.mockReturnValue(Promise.resolve(true));
        cache.specs["/file.png@main"] = { ext: "", codec: "foo", scale: 1 };
        cache.specs["/file.png@cover"] = { ext: "", codec: "bar", scale: 0.5, select: 0, blur: 1 };
        await encodeAll([asset]);
        expect(platform.exec).not.toBeCalled();
    });

    it("skips encoding when content with the same source and profile is already (being) encoded", async () => {
        await init({ root: "public", encode: { root: "public/encoded" } });
        asset.content.src = "/file.png";
        asset.content.info.type = "image/png";
        ctx.encodes.set("/file.png@main", Promise.resolve());
        ctx.encodes.set("/file.png@cover", Promise.resolve());
        await encodeAll([asset]);
        expect(platform.exec).not.toBeCalled();
    });

    it("doesn't skip encoding when cached spec differs", async () => {
        await init({
            root: "public",
            encode: {
                root: "public/encoded",
                main: { suffix: "", specs: [[/./, { ext: "", codec: "foo" }]] },
                cover: { suffix: "", specs: [[/./, { ext: "", codec: "bar", scale: 0.5, select: 0, blur: 1 }]] }
            }
        });
        asset.content.src = "/file.png";
        asset.content.info.type = "image/png";
        asset.dirty = false;
        platform.fs.exists.mockReturnValue(Promise.resolve(true));
        cache.specs["/file.png@main"] = { ext: "", codec: "foo", scale: 2 };
        cache.specs["/file.png@cover"] = { ext: "", codec: "baz", scale: 0.5, select: 0, blur: 1 };
        await encodeAll([asset]);
        expect(platform.exec).toBeCalledTimes(2);
    });

    it("encodes safe variant when content type is not safe", async () => {
        await init({ root: "public", encode: { root: "public/encoded" } });
        asset.content.src = "/assets/file.psd";
        asset.content.local = "public/assets/file.psd";
        asset.content.info.type = "image/psd";
        await encodeAll([asset]);
        expect(asset.content.safe).toStrictEqual("public/encoded/assets-file.psd@safe.webp");
    });

    it("doesnt encode safe variant when content type is safe", async () => {
        await init({
            root: "public",
            encode: {
                root: "public/encoded",
                safe: { suffix: "", types: ["image/png"], specs: [[/./, { ext: "" }]] }
            }
        });
        asset.content.src = "/assets/file.png";
        asset.content.local = "public/assets/file.png";
        asset.content.info.type = "image/png";
        await encodeAll([asset]);
        expect(asset.content.safe).toBeUndefined();
    });

    it("doesn't encode safe variant when disabled", async () => {
        await init({ root: "public", encode: { root: "public/encoded", safe: null } });
        asset.content.src = "/assets/file.png";
        asset.content.local = "public/assets/file.png";
        asset.content.info.type = "image/png";
        await encodeAll([asset]);
        expect(asset.content.safe).toBeUndefined();
    });

    it("encodes dense variant when global width threshold is x factor main encoded width", async () => {
        await init({
            root: "public",
            width: 1,
            encode: {
                root: "public/encoded",
                dense: { suffix: "@dense", factor: 10, specs: [[/./, { ext: "avif" }]] }
            }
        });
        asset.content.src = "/assets/file.png";
        asset.content.local = "public/assets/file.png";
        asset.content.info.type = "image/png";
        asset.content.info.width = 10;
        await encodeAll([asset]);
        expect(asset.content.dense).toStrictEqual("public/encoded/assets-file.png@dense.avif");
    });

    it("encodes dense variant when asset's width threshold is x factor main encoded width", async () => {
        await init({
            root: "public",
            width: undefined,
            encode: {
                root: "public/encoded",
                dense: { suffix: "@dense", factor: 10, specs: [[/./, { ext: "avif" }]] }
            }
        });
        asset.spec.width = 1;
        asset.content.src = "/assets/file.png";
        asset.content.local = "public/assets/file.png";
        asset.content.info.type = "image/png";
        asset.content.info.width = 10;
        await encodeAll([asset]);
        expect(asset.content.dense).toStrictEqual("public/encoded/assets-file.png@dense.avif");
    });

    it("doesn't encodes dense variant when disabled", async () => {
        await init({ root: "public", width: 1, encode: { root: "public/encoded", dense: null } });
        asset.content.src = "/assets/file.png";
        asset.content.local = "public/assets/file.png";
        asset.content.info.type = "image/png";
        asset.content.info.width = 10;
        await encodeAll([asset]);
        expect(asset.content.dense).toBeUndefined();
    });

    it("doesn't encodes dense variant when content type is not image", async () => {
        await init({
            root: "public",
            width: 1,
            encode: {
                root: "public/encoded",
                dense: { suffix: "@dense", factor: 10, specs: [[/./, { ext: "avif" }]] }
            }
        });
        asset.content.src = "/assets/file.mp4";
        asset.content.local = "public/assets/file.mp4";
        asset.content.info.type = "video/mp4";
        asset.content.info.width = 10;
        await encodeAll([asset]);
        expect(asset.content.dense).toBeUndefined();
    });

    it("doesn't encode dense variant when neither global, not per-asset threshold is specified", async () => {
        await init({
            root: "public",
            width: undefined,
            encode: {
                root: "public/encoded",
                dense: { suffix: "@dense", factor: 10, specs: [[/./, { ext: "avif" }]] }
            }
        });
        asset.spec.width = undefined;
        asset.content.src = "/assets/file.png";
        asset.content.local = "public/assets/file.png";
        asset.content.info.type = "image/png";
        asset.content.info.width = 10;
        await encodeAll([asset]);
        expect(asset.content.dense).toBeUndefined();
    });

    it("doesn't encode dense variant when content width is below threshold multiplied by factor", async () => {
        await init({
            root: "public",
            width: 2,
            encode: {
                root: "public/encoded",
                dense: { suffix: "@dense", factor: 10, specs: [[/./, { ext: "avif" }]] }
            }
        });
        asset.content.src = "/assets/file.png";
        asset.content.local = "public/assets/file.png";
        asset.content.info.type = "image/png";
        asset.content.info.width = 10;
        await encodeAll([asset]);
        expect(asset.content.dense).toBeUndefined();
    });

    it("blurs dense variant when specified in spec config", async () => {
        await init({
            root: "public",
            cover: null,
            encode: { dense: { suffix: "", factor: 2, specs: [[/./, { ext: "", blur: 1 }]] } }
        });
        asset.spec.width = 1;
        asset.content.info.width = 2;
        await encodeAll([asset]);
        expect(platform.exec).toBeCalledWith(expect.stringContaining("boxblur="));
    });

    it("encodes cover variant by default", async () => {
        await init({ root: "public", encode: { ...defs.encode, root: "public/encoded" } });
        asset.content.src = "/assets/file.png";
        asset.content.local = "public/assets/file.png";
        asset.content.info.type = "image/png";
        await encodeAll([asset]);
        expect(asset.content.cover).toStrictEqual("public/encoded/assets-file.png@cover.avif");
    });

    it("doesn't encode cover when disabled globally", async () => {
        await init({ root: "public", cover: null });
        asset.content.src = "/assets/file.png";
        asset.content.local = "public/assets/file.png";
        asset.content.info.type = "image/png";
        await encodeAll([asset]);
        expect(asset.content.cover).toBeUndefined();
    });

    it("doesn't encode cover when disabled via encoding config", async () => {
        await init({ root: "public", encode: { ...defs.encode, cover: null } });
        asset.content.src = "/assets/file.png";
        asset.content.local = "public/assets/file.png";
        asset.content.info.type = "image/png";
        await encodeAll([asset]);
        expect(asset.content.cover).toBeUndefined();
    });

    it("logs ffmpeg error", async () => {
        await init();
        platform.exec.mockReturnValue(Promise.resolve({ out: "", err: Error("foo") }));
        await encodeAll([asset]);
        expect(platform.log.err).toBeCalledWith("ffmpeg error: foo");
    });

    it("maps alpha channel when content has alpha and container is avif", async () => {
        await init({ root: "public" });
        asset.content.info.type = "image/png";
        asset.content.info.alpha = true;
        await encodeAll([asset]);
        expect(platform.exec).toBeCalledWith(expect.stringContaining("-map"));
    });

    it("doesn't maps alpha channel when content has no alpha", async () => {
        await init({ root: "public" });
        asset.content.info.type = "image/png";
        asset.content.info.alpha = false;
        await encodeAll([asset]);
        expect(platform.exec).toBeCalledWith(expect.not.stringContaining("-map"));
    });

    it("doesn't maps alpha channel when content has alpha, but container is not avif", async () => {
        await init({ root: "public" });
        asset.content.info.type = "video/webm";
        asset.content.info.alpha = true;
        await encodeAll([asset]);
        expect(platform.exec).toBeCalledWith(expect.stringContaining("-map"));
    });

    it("respects custom suffixes", async () => {
        await init({
            root: "public",
            width: 1,
            encode: {
                root: "public/encoded",
                main: { suffix: "@foo", specs: [[/./, { ext: "avif" }]] },
                cover: { suffix: "@bar", specs: [[/./, { ext: "avif" }]] },
                dense: { suffix: "@baz", factor: 2, specs: [[/./, { ext: "avif" }]] },
                safe: { suffix: "@far", types: [], specs: [[/./, { ext: "webp" }]] }
            }
        });
        asset.content.src = "/assets/file.png";
        asset.content.local = "public/assets/file.png";
        asset.content.info.type = "image/png";
        asset.content.info.width = 10;
        await encodeAll([asset]);
        expect(asset.content.encoded).toStrictEqual("public/encoded/assets-file.png@foo.avif");
        expect(asset.content.cover).toStrictEqual("public/encoded/assets-file.png@bar.avif");
        expect(asset.content.dense).toStrictEqual("public/encoded/assets-file.png@baz.avif");
        expect(asset.content.safe).toStrictEqual("public/encoded/assets-file.png@far.webp");
    });

    it("compatible plugin overrides built-in behaviour", async () => {
        await init({ plugins: [{ encode: () => true }] });
        const spy = vi.spyOn(asset.content, "encoded", "set");
        await encodeAll([asset]);
        expect(spy).not.toBeCalled();
    });

    it("incompatible plugins don't override built-in behaviour", async () => {
        await init({ plugins: [{}, { encode: () => false }] });
        asset.content.src = "/";
        const spy = vi.spyOn(asset.content, "encoded", "set");
        await encodeAll([asset]);
        expect(spy).toBeCalled();
    });
});

async function init(prefs?: Prefs): Promise<void> {
    await boot(prefs, platform);
}
