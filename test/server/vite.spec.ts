import { it, expect, vi } from "vitest";
import { std, boot } from "./common.js";
import vite from "../../src/plugin/vite.js";
import youtube from "../../src/plugin/youtube/index.js";

it("invokes server transform on document transform", async () => {
    const transform = vi.spyOn(await import("../../src/server/transform/index.js"), "transform");
    await vite().transform("", "");
    expect(transform).toHaveBeenCalled();
});

it("doesn't invoke transform when document matches skip config", async () => {
    const transform = vi.spyOn(await import("../../src/server/transform/index.js"), "transform");
    await vite({ skip: (filename) => !filename.endsWith(".md") }).transform("", "foo.js");
    expect(transform).not.toHaveBeenCalled();
});

it("injects main client module and styles to index html", async () => {
    await boot();
    std.path.resolve.mockReturnValue("foo");
    expect(await vite().transformIndexHtml.handler("", { filename: "" })).toStrictEqual({
        html: "",
        tags: [{
            tag: "link", injectTo: "head",
            attrs: { "rel": "stylesheet", "type": "text/css", "href": expect.stringContaining("foo") }
        }, {
            tag: "script", injectTo: "body", attrs: { type: "module" },
            children: expect.stringContaining("foo")
        }]
    });
});

it("injects plugin client modules and styles to index html", async () => {
    await boot();
    std.path.resolve.mockReturnValue("foo");
    expect(await vite({ plugins: [youtube()] }).transformIndexHtml.handler("", { filename: "" })).toStrictEqual({
        html: "",
        tags: [{
            tag: "link", injectTo: "head",
            attrs: { "rel": "stylesheet", "type": "text/css", "href": expect.stringContaining("foo") }
        }, {
            tag: "script", injectTo: "body", attrs: { type: "module" },
            children: expect.stringContaining("foo")
        }, {
            tag: "script", injectTo: "body", attrs: { type: "module" },
            children: expect.stringContaining("client.js")
        }, {
            tag: "link", injectTo: "head",
            attrs: { "rel": "stylesheet", "type": "text/css", "href": expect.stringContaining("styles.css") }
        }]
    });
});

it("doesn't inject client module when disabled in plugin config", async () => {
    await boot();
    std.path.resolve.mockReturnValue("bar");
    expect(await vite({ inject: false }).transformIndexHtml.handler("", { filename: "" })).toStrictEqual({
        html: "",
        tags: []
    });
});
