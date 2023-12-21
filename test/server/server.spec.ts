import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { setup, tear, boot, std, defs } from "./common.js";
import { transform, exit, cfg } from "../../src/server/index.js";

beforeEach(setup);
afterEach(tear);

describe("meta", () => {
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
});

describe("transform", () => {
    it("returns empty when input is empty", async () => {
        await boot();
        expect(await transform("", "")).toStrictEqual("");
    });
});

describe("cache", () => {
    it("reads and writes to configured root", async () => {
        std.fs.exists.mockReturnValue(Promise.resolve(true));
        std.fs.read.mockReturnValue(<never>Promise.resolve("{}"));
        std.path.join.mockImplementation(p => p);
        await boot({ cache: { root: "foo" } });
        await exit();
        expect(std.fs.read).toBeCalledWith(expect.stringContaining("foo"), "utf8");
        expect(std.fs.write).toBeCalledWith(expect.stringContaining("foo"), expect.anything());
    });

    it("doesn't read not write when cache is disabled", async () => {
        await boot({ cache: null });
        await exit();
        expect(std.fs.read).not.toBeCalled();
        expect(std.fs.write).not.toBeCalled();
    });
});
