import { it, expect, vi } from "vitest";
import { std, boot } from "./common.js";
import vite from "../../src/plugin/vite.js";
import youtube from "../../src/plugin/youtube/index.js";

it("invokes server transform on document transform", async () => {
    const transform = vi.spyOn(await import("../../src/server/transform/index.js"), "transform");
    vite().transform("", "");
    expect(transform).toHaveBeenCalled();
});

it("doesn't invoke transform when document matches skip config", async () => {
    const transform = vi.spyOn(await import("../../src/server/transform/index.js"), "transform");
    vite({ skip: (_, id) => !id.endsWith(".md") }).transform("", "foo.js");
    expect(transform).not.toHaveBeenCalled();
});

it("injects main client module to index html body", async () => {
    await boot();
    std.path.resolve.mockReturnValue("foo");
    expect(vite().transformIndexHtml("")).toStrictEqual([{
        attrs: { src: expect.stringContaining("foo"), type: "module" },
        injectTo: "body", tag: "script"
    }]);
});

it("injects plugin client modules to index html body", async () => {
    await boot();
    std.path.resolve.mockReturnValue("foo");
    expect(vite({ plugins: [youtube()] }).transformIndexHtml("")).toStrictEqual([{
        attrs: { src: expect.stringContaining("foo"), type: "module" },
        injectTo: "body", tag: "script"
    }, {
        attrs: { src: expect.stringContaining("client.js"), type: "module" },
        injectTo: "body", tag: "script"
    }]);
});

it("doesn't inject client module when disabled in plugin config", async () => {
    await boot();
    std.path.resolve.mockReturnValue("bar");
    expect(vite({ inject: false }).transformIndexHtml("")).toStrictEqual("");
});
