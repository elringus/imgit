import { it, expect, beforeEach, afterEach } from "vitest";
import { setup, tear, boot, defs } from "./common.js";
import { cfg } from "../../src/server/index.js";

beforeEach(setup);
afterEach(tear);

it("configures in init", async () => {
    await boot({ root: "public", cover: null, encode: { ...defs.encode, cover: null } });
    expect(cfg.root).toStrictEqual("public");
    expect(cfg.cover).toBeNull();
    expect(cfg.encode.cover).toBeNull();
});

it("doesn't leak config between runs", async () => {
    await boot();
    expect(cfg.root).not.toStrictEqual("public");
    expect(cfg.cover).not.toBeNull();
    expect(cfg.encode.cover).not.toBeNull();
});
