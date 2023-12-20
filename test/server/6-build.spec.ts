import { it, expect, beforeEach, afterEach, vi } from "vitest";
import { setup, tear, boot, asset } from "./common.js";
import { buildAll } from "../../src/server/transform/6-build.js";

beforeEach(setup);
afterEach(tear);

it("allows compatible plugin override behaviour", async () => {
    await boot({ plugins: [{ build: () => true }] });
    const spy = vi.spyOn(asset, "html", "set");
    await buildAll([asset]);
    expect(spy).not.toBeCalled();
});

it("doesn't allow incompatible plugin override behaviour", async () => {
    await boot({ plugins: [{}, { build: () => false }] });
    asset.content.info.type = "image/png";
    const spy = vi.spyOn(asset, "html", "set");
    await buildAll([asset]);
    expect(spy).toBeCalled();
});
