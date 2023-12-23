import { it, expect, beforeEach, afterEach } from "vitest";
import { setup, tear, boot, asset, std } from "./common.js";
import { cache } from "../../src/server/index.js";
import { resolveAll } from "../../src/server/transform/2-resolve.js";
import { buildAll } from "../../src/server/transform/6-build.js";
import youtube from "../../src/plugin/youtube/index.js";

beforeEach(setup);
afterEach(tear);

it("injects client module and styles", async () => {
    await boot();
    expect(youtube().inject!()).toHaveLength(2);
});

it("creates 'youtube' empty cache record on init in case it doesn't exist", async () => {
    delete cache["youtube"];
    await boot({ plugins: [youtube()] });
    expect(cache["youtube"]).toStrictEqual({});
});

it("doesn't reset 'youtube' cache record on init in case it exists", async () => {
    cache["youtube"] = { foo: "bar" };
    await boot({ plugins: [youtube()] });
    expect(cache["youtube"]).toStrictEqual({ foo: "bar" });
});

it("resolves youtube thumbnail as content source", async () => {
    std.fetch.mockReturnValue(<never>Promise.resolve({ ok: true, url: "foo-thumb" }));
    await boot({ plugins: [youtube()] });
    asset.syntax.url = "https://youtube.com/watch?v=foo";
    await resolveAll([asset]);
    expect(asset.content.src).toStrictEqual("foo-thumb");
});

it("uses cached youtube thumbnail when exists", async () => {
    await boot({ plugins: [youtube()] });
    (<{ foo: string }>cache["youtube"])["foo"] = "foo-thumb";
    asset.syntax.url = "https://youtube.com/watch?v=foo";
    await resolveAll([asset]);
    expect(asset.content.src).toStrictEqual("foo-thumb");
    expect(std.fetch).not.toBeCalled();
});

it("warns when fails to resolve thumbnail", async () => {
    std.fetch.mockReturnValue(<never>Promise.resolve({ ok: false, url: "" }));
    await boot({ plugins: [youtube()] });
    asset.syntax.url = "https://youtube.com/watch?v=foo";
    await resolveAll([asset]);
    expect(std.log.warn).toBeCalledWith(expect.stringMatching(/Failed to resolve thumbnail/));
});

it("resolves asset spec", async () => {
    std.fetch.mockReturnValue(<never>Promise.resolve({ ok: true, url: "foo-thumb" }));
    await boot({ plugins: [youtube()] });
    asset.syntax.url = "https://youtube.com/watch?v=foo";
    asset.syntax.spec = "?class=bar&eager";
    await resolveAll([asset]);
    expect(asset.spec.class).toStrictEqual("bar");
    expect(asset.spec.eager).toBeTruthy();
});

it("doesn't resolve non-youtube assets", async () => {
    std.fetch.mockReturnValue(<never>Promise.resolve({ ok: true, url: "foo-thumb" }));
    await boot({ plugins: [youtube()] });
    asset.syntax.url = "https://mytube.com/watch?v=foo";
    await resolveAll([asset]);
    expect(asset.content.src).not.toStrictEqual("foo-thumb");
});

it("builds embedded youtube player iframe with resolved video id", async () => {
    await boot({ plugins: [youtube()] });
    asset.content.info.type = "image/webp";
    asset.syntax.url = "https://youtube.com/watch?v=foo";
    await buildAll([asset]);
    expect(asset.html).toContain("<iframe");
    expect(asset.html).toContain(`data-src="https://www.youtube-nocookie.com/embed/foo`);
});

it("doesn't build non-youtube assets", async () => {
    await boot({ plugins: [youtube()] });
    asset.content.info.type = "image/webp";
    asset.syntax.url = "https://mytube.com/watch?v=foo";
    await buildAll([asset]);
    expect(asset.html).not.toContain("<iframe");
});

it("assigns imgit-youtube css class to built html", async () => {
    await boot({ plugins: [youtube()] });
    asset.content.info.type = "image/webp";
    asset.syntax.url = "https://youtube.com/watch?v=foo";
    await buildAll([asset]);
    expect(asset.html).toContain(`class="imgit-youtube`);
});

it("includes css class defined in spec", async () => {
    await boot({ plugins: [youtube()] });
    asset.content.info.type = "image/webp";
    asset.syntax.url = "https://youtube.com/watch?v=foo";
    asset.spec.class = "bar";
    await buildAll([asset]);
    expect(asset.html).toContain(`class="imgit-youtube bar`);
});

it("builds banner with video href by default", async () => {
    await boot({ plugins: [youtube()] });
    asset.content.info.type = "image/webp";
    asset.syntax.url = "https://youtube.com/watch?v=foo";
    await buildAll([asset]);
    expect(asset.html).toContain(`data-href="https://youtube.com/watch?v=foo`);
});

it("doesn't build banner when disabled in plugin config", async () => {
    await boot({ plugins: [youtube({ banner: false })] });
    asset.content.info.type = "image/webp";
    asset.syntax.url = "https://youtube.com/watch?v=foo";
    await buildAll([asset]);
    expect(asset.html).not.toContain(`data-href="https://youtube.com/watch?v=foo`);
});

it("builds title when alt is captured in syntax", async () => {
    await boot({ plugins: [youtube()] });
    asset.content.info.type = "image/webp";
    asset.syntax.url = "https://youtube.com/watch?v=foo";
    asset.syntax.alt = "bar";
    await buildAll([asset]);
    expect(asset.html).toContain(`<div class="imgit-youtube-title">bar</div>`);
});

it("doesn't builds title when disabled in plugin config", async () => {
    await boot({ plugins: [youtube({ title: false })] });
    asset.content.info.type = "image/webp";
    asset.syntax.url = "https://youtube.com/watch?v=foo";
    asset.syntax.alt = "bar";
    await buildAll([asset]);
    expect(asset.html).not.toContain(`<div class="imgit-youtube-title">bar</div>`);
});
