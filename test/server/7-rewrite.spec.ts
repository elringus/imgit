import { it, expect, beforeEach, afterEach, vi } from "vitest";
import { setup, tear, boot, asset } from "./common.js";
import { rewriteAll } from "../../src/server/transform/7-rewrite.js";

beforeEach(setup);
afterEach(tear);

it("allows compatible plugin override behaviour", async () => {
    await boot({ plugins: [{ rewrite: () => "" }] });
    const spy = vi.spyOn(asset, "html", "get");
    await rewriteAll("", "", [asset]);
    expect(spy).not.toBeCalled();
});

it("doesn't allow incompatible plugin override behaviour", async () => {
    await boot({ plugins: [{}, { rewrite: () => null }] });
    const spy = vi.spyOn(asset, "html", "get");
    await rewriteAll("", "", [asset]);
    expect(spy).toBeCalled();
});
