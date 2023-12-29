import { it, expect, beforeEach, afterEach } from "vitest";
import { setup, tear, boot, std, asset } from "./common.js";
import { buildAll } from "../../src/server/transform/6-build.js";
import svg from "../../src/plugin/svg.js";

beforeEach(setup);
afterEach(tear);

it("embeds file content of svg assets to html", async () => {
    await boot({ plugins: [svg()] });
    asset.syntax.url = "/file.svg";
    std.fs.read.mockReturnValue(<never>Promise.resolve("foo"));
    await buildAll([asset]);
    expect(asset.html).toContain("foo");
});

it("ignores non-svg assets", async () => {
    await boot({ plugins: [svg()] });
    asset.content.info.type = "image/png";
    asset.syntax.url = "/file.png";
    std.fs.read.mockReturnValue(<never>Promise.resolve("foo"));
    await buildAll([asset]);
    expect(asset.html).not.toContain("foo");
});

it("assigns imgit-svg css class to built html", async () => {
    await boot({ plugins: [svg()] });
    asset.syntax.url = "/file.svg";
    await buildAll([asset]);
    expect(asset.html).toContain(`class="imgit-svg`);
});

it("includes css class defined in spec", async () => {
    await boot({ plugins: [svg()] });
    asset.syntax.url = "/file.svg";
    asset.spec.class = "foo";
    await buildAll([asset]);
    expect(asset.html).toContain(`class="imgit-svg foo`);
});
