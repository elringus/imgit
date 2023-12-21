import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { setup, tear, boot, std } from "./common.js";
import { transform, exit } from "../../src/server/index.js";

beforeEach(setup);
afterEach(tear);

describe("transform", () => {
    it("return empty when input is empty", async () => {
        await boot();
        const content = await transform("", "");
        expect(content).toStrictEqual("");
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
