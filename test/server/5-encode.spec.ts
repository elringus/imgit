import { it, expect, vi, beforeEach, afterEach } from "vitest";
import { setup, tear, boot, defs, std, asset } from "./common.js";
import { cache, ctx } from "../../src/server/index.js";
import { encodeAll } from "../../src/server/transform/5-encode.js";

beforeEach(setup);
afterEach(tear);

beforeEach(() => {
    std.exec.mockReturnValue(Promise.resolve({ out: "" }));
    asset.content.info = { width: 1, height: 1, type: "image/png" };
    std.path.resolve = vi.fn(p => p);
});

it("waits for for all fetches to complete before encoding", async () => {
    await boot();
    ctx.fetches.set("/1.png", Promise.resolve());
    std.wait.mockImplementationOnce(() => {
        ctx.fetches.set("/2.png", Promise.resolve());
        return Promise.resolve();
    });
    await encodeAll([asset]);
    expect(std.wait).toBeCalledTimes(2);
});

it("throws when can't get spec for encoded content type", async () => {
    await boot();
    asset.content.info.type = "foo";
    await expect(encodeAll([asset])).rejects.toThrow(/Failed to get encoding spec/);
});

it("encodes to avif when content type is image", async () => {
    await boot({ root: "public", encode: { root: "public/encoded" } });
    asset.content.src = "/assets/file.png";
    asset.content.local = "public/assets/file.png";
    asset.content.info.type = "image/png";
    await encodeAll([asset]);
    expect(asset.content.encoded).toStrictEqual("public/encoded/assets-file.png@main.avif");
});

it("encodes to mp4 (with av1 codec) when content type is video", async () => {
    await boot({ encode: { root: "public/encoded" } });
    asset.content.src = "http://host.name/file.webm";
    asset.content.local = "fetched/host.name-file.webm";
    std.path.basename.mockReturnValue("host.name-file.webm");
    asset.content.info.type = "video/webm";
    await encodeAll([asset]);
    expect(asset.content.encoded).toStrictEqual("public/encoded/host.name-file.webm@main.mp4");
});

it("scales down to specified global width threshold when content width is larger", async () => {
    await boot({ root: "public", width: 1, encode: { root: "public/encoded" } });
    asset.content.src = "/assets/file.png";
    asset.content.local = "public/assets/file.png";
    asset.content.info.type = "image/png";
    asset.content.info.width = 10;
    await encodeAll([asset]);
    expect(std.exec).toBeCalledWith(expect.stringContaining("scale=iw*0.1"));
});

it("scales down to specified asset width threshold when content width is larger", async () => {
    await boot({ root: "public", encode: { root: "public/encoded" } });
    asset.content.src = "/assets/file.png";
    asset.content.local = "public/assets/file.png";
    asset.content.info.type = "image/png";
    asset.content.info.width = 10;
    asset.spec.width = 5;
    await encodeAll([asset]);
    expect(std.exec).toBeCalledWith(expect.stringContaining("scale=iw*0.5"));
});

it("respects encode spec scaling when resolving scale factor for width threshold", async () => {
    await boot({
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
    expect(std.exec).toBeCalledWith(expect.stringContaining("scale=iw*0.1"));
});

it("skips encoding when asset is not dirty, encoded file exist and spec cache is valid", async () => {
    await boot({
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
    std.fs.exists.mockReturnValue(Promise.resolve(true));
    cache.specs["/file.png@main"] = { ext: "", codec: "foo", scale: 1 };
    cache.specs["/file.png@cover"] = { ext: "", codec: "bar", scale: 0.5, select: 0, blur: 1 };
    await encodeAll([asset]);
    expect(std.exec).not.toBeCalled();
});

it("skips encoding when content with the same source and profile is already (being) encoded", async () => {
    await boot({ root: "public", encode: { root: "public/encoded" } });
    asset.content.src = "/file.png";
    asset.content.info.type = "image/png";
    ctx.encodes.set("/file.png@main", Promise.resolve());
    ctx.encodes.set("/file.png@cover", Promise.resolve());
    await encodeAll([asset]);
    expect(std.exec).not.toBeCalled();
});

it("doesn't skip encoding when cached spec differs", async () => {
    await boot({
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
    std.fs.exists.mockReturnValue(Promise.resolve(true));
    cache.specs["/file.png@main"] = { ext: "", codec: "foo", scale: 2 };
    cache.specs["/file.png@cover"] = { ext: "", codec: "baz", scale: 0.5, select: 0, blur: 1 };
    await encodeAll([asset]);
    expect(std.exec).toBeCalledTimes(2);
});

it("encodes safe variant when content type is not safe", async () => {
    await boot({ root: "public", encode: { root: "public/encoded" } });
    asset.content.src = "/assets/file.psd";
    asset.content.local = "public/assets/file.psd";
    asset.content.info.type = "image/psd";
    await encodeAll([asset]);
    expect(asset.content.safe).toStrictEqual("public/encoded/assets-file.psd@safe.webp");
});

it("doesnt encode safe variant when content type is safe", async () => {
    await boot({
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
    await boot({ root: "public", encode: { root: "public/encoded", safe: null } });
    asset.content.src = "/assets/file.png";
    asset.content.local = "public/assets/file.png";
    asset.content.info.type = "image/png";
    await encodeAll([asset]);
    expect(asset.content.safe).toBeUndefined();
});

it("encodes dense variant when global width threshold is x factor main encoded width", async () => {
    await boot({
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
    await boot({
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
    await boot({ root: "public", width: 1, encode: { root: "public/encoded", dense: null } });
    asset.content.src = "/assets/file.png";
    asset.content.local = "public/assets/file.png";
    asset.content.info.type = "image/png";
    asset.content.info.width = 10;
    await encodeAll([asset]);
    expect(asset.content.dense).toBeUndefined();
});

it("doesn't encodes dense variant when content type is not image", async () => {
    await boot({
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
    await boot({
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
    await boot({
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
    await boot({
        root: "public",
        cover: null,
        encode: { dense: { suffix: "", factor: 2, specs: [[/./, { ext: "", blur: 1 }]] } }
    });
    asset.spec.width = 1;
    asset.content.info.width = 2;
    await encodeAll([asset]);
    expect(std.exec).toBeCalledWith(expect.stringContaining("boxblur="));
});

it("encodes cover variant by default", async () => {
    await boot({ root: "public", encode: { ...defs.encode, root: "public/encoded" } });
    asset.content.src = "/assets/file.png";
    asset.content.local = "public/assets/file.png";
    asset.content.info.type = "image/png";
    await encodeAll([asset]);
    expect(asset.content.cover).toStrictEqual("public/encoded/assets-file.png@cover.avif");
});

it("doesn't encode cover when disabled globally", async () => {
    await boot({ root: "public", cover: null });
    asset.content.src = "/assets/file.png";
    asset.content.local = "public/assets/file.png";
    asset.content.info.type = "image/png";
    await encodeAll([asset]);
    expect(asset.content.cover).toBeUndefined();
});

it("doesn't encode cover when disabled via encoding config", async () => {
    await boot({ root: "public", encode: { ...defs.encode, cover: null } });
    asset.content.src = "/assets/file.png";
    asset.content.local = "public/assets/file.png";
    asset.content.info.type = "image/png";
    await encodeAll([asset]);
    expect(asset.content.cover).toBeUndefined();
});

it("logs ffmpeg error", async () => {
    await boot();
    std.exec.mockReturnValue(Promise.resolve({ out: "", err: Error("foo") }));
    await encodeAll([asset]);
    expect(std.log.err).toBeCalledWith("ffmpeg error: foo");
});

it("maps alpha channel when content has alpha and container is avif", async () => {
    await boot({ root: "public" });
    asset.content.info.type = "image/png";
    asset.content.info.alpha = true;
    await encodeAll([asset]);
    expect(std.exec).toBeCalledWith(expect.stringContaining("-map"));
});

it("doesn't maps alpha channel when content has no alpha", async () => {
    await boot({ root: "public" });
    asset.content.info.type = "image/png";
    asset.content.info.alpha = false;
    await encodeAll([asset]);
    expect(std.exec).toBeCalledWith(expect.not.stringContaining("-map"));
});

it("doesn't maps alpha channel when content has alpha, but container is not avif", async () => {
    await boot({ root: "public" });
    asset.content.info.type = "video/webm";
    asset.content.info.alpha = true;
    await encodeAll([asset]);
    expect(std.exec).toBeCalledWith(expect.stringContaining("-map"));
});

it("respects custom suffixes", async () => {
    await boot({
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

it("allows compatible plugin override behaviour", async () => {
    await boot({ plugins: [{ encode: () => true }] });
    const spy = vi.spyOn(asset.content, "encoded", "set");
    await encodeAll([asset]);
    expect(spy).not.toBeCalled();
});

it("doesn't allow incompatible plugin override behaviour", async () => {
    await boot({ plugins: [{}, { encode: () => false }] });
    asset.content.src = "/";
    const spy = vi.spyOn(asset.content, "encoded", "set");
    await encodeAll([asset]);
    expect(spy).toBeCalled();
});
