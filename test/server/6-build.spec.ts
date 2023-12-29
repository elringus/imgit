import { it, expect, beforeEach, afterEach, vi } from "vitest";
import { setup, tear, boot, asset, std, defs } from "./common.js";
import { buildAll } from "../../src/server/transform/6-build.js";
import { cache } from "../../src/server/index.js";

beforeEach(setup);
afterEach(tear);

beforeEach(() => {
    std.path.relative = <never>vi.fn(a => a);
    std.path.basename = vi.fn(a => a.replaceAll("/", ""));
    std.base64.mockReturnValue(Promise.resolve("base64"));
});

it("builds picture HTML with srcset for image", async () => {
    await boot({ root: "public" });
    asset.content.info.type = "image/png";
    asset.content.encoded = "/file.png@main.avif";
    await buildAll([asset]);
    expect(asset.html).toContain("<picture");
    expect(asset.html).toContain(`<source srcset="/public/file.png@main.avif`);
});

it("builds video HTML with data-src attribute for video", async () => {
    await boot({ root: "public" });
    asset.content.info.type = "video/webm";
    asset.content.encoded = "/file.webm@main.mp4";
    await buildAll([asset]);
    expect(asset.html).toContain("<video");
    expect(asset.html).toContain(`<source data-imgit-src="/public/file.webm@main.mp4"`);
});

it("throws when content type is neither image nor video", async () => {
    await boot({ root: "public" });
    asset.content.info.type = "foo";
    await expect(buildAll([asset])).rejects.toThrow(/unknown type/);
});

it("specifies content width and height", async () => {
    await boot({ root: "public" });
    asset.content.info = { type: "image/png", width: 100, height: 50 };
    await buildAll([asset]);
    expect(asset.html).toContain(`width="100" height="50"`);
});

it("respects width threshold for specifies width and height", async () => {
    await boot({ width: 10, root: "public" });
    asset.content.info = { type: "image/png", width: 100, height: 100 };
    await buildAll([asset]);
    expect(asset.html).toContain(`width="10" height="10"`);
});

it("respects asset spec threshold for specifies width and height", async () => {
    await boot({ width: 10, root: "public" });
    asset.content.info = { type: "image/png", width: 100, height: 100 };
    asset.spec.width = 50;
    await buildAll([asset]);
    expect(asset.html).toContain(`width="50" height="50"`);
});

it("adds lazy attribute to images by default", async () => {
    await boot({ root: "public" });
    asset.content.info.type = "image/png";
    await buildAll([asset]);
    expect(asset.html).toContain(`loading="lazy"`);
});

it("doesn't add lazy attribute when eager spec is defined", async () => {
    await boot({ root: "public" });
    asset.content.info.type = "image/png";
    asset.spec.eager = true;
    await buildAll([asset]);
    expect(asset.html).not.toContain(`loading="lazy"`);
});

it("assigns imgit-picture css class to images", async () => {
    await boot();
    asset.content.info.type = "image/png";
    await buildAll([asset]);
    expect(asset.html).toContain(`class="imgit-picture`);
});

it("includes css class specified in spec to images", async () => {
    await boot();
    asset.content.info.type = "image/png";
    asset.spec.class = "foo";
    await buildAll([asset]);
    expect(asset.html).toContain(`class="imgit-picture foo`);
});

it("assigns imgit-video css class to videos", async () => {
    await boot();
    asset.content.info.type = "video/webm";
    await buildAll([asset]);
    expect(asset.html).toContain(`class="imgit-video`);
});

it("includes css class specified in spec to videos", async () => {
    await boot();
    asset.content.info.type = "video/mp4";
    asset.spec.class = "foo";
    await buildAll([asset]);
    expect(asset.html).toContain(`class="imgit-video foo`);
});

it("merges image with merge spec and assigns empty HTML to merged asset", async () => {
    await boot({ root: "public" });
    asset.content.info.type = "image/png";
    asset.content.encoded = "/foo";
    const merged = {
        ...asset,
        content: { ...asset.content, encoded: "/bar" },
        spec: { ...asset.spec, media: "(media)", merge: true }
    };
    await buildAll([asset, merged]);
    expect(asset.html).toContain(`srcset="/public/foo`);
    expect(asset.html).toContain(`srcset="/public/bar`);
    expect(asset.html).toContain(`media="(media)"`);
    expect(merged.html).toStrictEqual("");
});

it("builds cover with image source encoded in base64", async () => {
    await boot({ root: "public" });
    asset.content.info.type = "image/png";
    asset.content.cover = "/file.png@cover.avif";
    std.base64.mockReturnValue(Promise.resolve("foo"));
    await buildAll([asset]);
    expect(asset.html).toContain(`srcset="data:image/avif;base64,foo`);
});

it("builds cover for merged assets", async () => {
    await boot({ root: "public" });
    asset.syntax.url = "foo";
    asset.content.info.type = "image/png";
    asset.content.cover = "/foo@cover";
    const merged = {
        ...asset,
        syntax: { ...asset.syntax, url: "bar" },
        content: { ...asset.content, cover: "/bar@cover" },
        spec: { ...asset.spec, media: "(media)", merge: true }
    };
    std.base64.mockReturnValueOnce(Promise.resolve("foo@base64"));
    std.base64.mockReturnValueOnce(Promise.resolve("bar@base64"));
    await buildAll([asset, merged]);
    expect(asset.html).toContain(`srcset="data:image/avif;base64,foo@base64`);
    expect(asset.html).toContain(`srcset="data:image/avif;base64,bar@base64`);
    expect(asset.html).toContain(`(media)`);
});

it("includes cover source specified globally", async () => {
    await boot({ root: "public", cover: "foo" });
    asset.content.info.type = "image/png";
    asset.content.cover = "/file.png@cover.avif";
    await buildAll([asset]);
    expect(asset.html).not.toContain(`srcset="foo`);
});

it("doesn't build cover when disabled globally", async () => {
    await boot({ root: "public", cover: null });
    asset.content.info.type = "image/png";
    asset.content.cover = "/file.png@cover.avif";
    await buildAll([asset]);
    expect(asset.html).not.toContain(`@cover`);
});

it("reuses cached cover base64 when asset is not dirty", async () => {
    await boot({ root: "public" });
    asset.syntax.url = "/file.png";
    asset.content.info.type = "image/png";
    asset.content.cover = "/file.png@cover.avif";
    cache.covers["/file.png"] = "cached";
    await buildAll([asset]);
    expect(asset.html).toContain(`srcset="data:image/avif;base64,cached`);
    expect(std.base64).not.toBeCalled();
});

it("doesn't reuse cached cover base64 when asset is dirty and updates cache", async () => {
    await boot({ root: "public" });
    asset.dirty = true;
    asset.syntax.url = "/file.png";
    asset.content.info.type = "image/png";
    asset.content.cover = "/file.png@cover.avif";
    cache.covers["/file.png"] = "foo";
    std.base64.mockReturnValue(Promise.resolve("bar"));
    await buildAll([asset]);
    expect(asset.html).toContain(`srcset="data:image/avif;base64,bar`);
    expect(std.base64).toBeCalled();
    expect(cache.covers["/file.png"]).toStrictEqual("bar");
});

it("builds dense with specified factor", async () => {
    await boot({ root: "public", encode: { ...defs.encode, dense: { suffix: "", specs: [], factor: 1.5 } } });
    asset.content.info.type = "image/png";
    asset.content.dense = "/file.png@dense.avif";
    await buildAll([asset]);
    expect(asset.html).toContain(`/public/file.png@dense.avif 1.5x`);
});

it("includes media to video", async () => {
    await boot();
    asset.content.info.type = "video/webm";
    asset.spec.media = "(foo)";
    await buildAll([asset]);
    expect(asset.html).toContain(`(foo)`);
});

it("allows compatible build plugin override behaviour", async () => {
    await boot({ plugins: [{ build: () => true }] });
    const spy = vi.spyOn(asset, "html", "set");
    await buildAll([asset]);
    expect(spy).not.toBeCalled();
});

it("doesn't allow incompatible build plugin override behaviour", async () => {
    await boot({ plugins: [{}, { build: () => false }] });
    asset.content.info.type = "image/png";
    const spy = vi.spyOn(asset, "html", "set");
    await buildAll([asset]);
    expect(spy).toBeCalled();
});

it("allows compatible serve plugin override served source", async () => {
    await boot({ root: "public", plugins: [{ serve: async () => "foo" }] });
    asset.content.info.type = "image/png";
    asset.content.encoded = "bar";
    await buildAll([asset]);
    expect(asset.html).toContain(`srcset="foo`);
    expect(asset.html).not.toContain(`srcset="/public/bar`);
});

it("doesn't allow incompatible serve plugin override served source", async () => {
    await boot({ root: "public", plugins: [{}, { serve: () => null }] });
    asset.content.info.type = "image/png";
    asset.content.encoded = "bar";
    await buildAll([asset]);
    expect(asset.html).toContain(`srcset="/public/bar`);
});

it("wraps in JSX when configured", async () => {
    await boot({ root: "public", build: "jsx" });
    asset.content.info.type = "image/png";
    await buildAll([asset]);
    expect(asset.html).toContain("dangerouslySetInnerHTML");
});
