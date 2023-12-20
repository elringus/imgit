import { it, expect, vi, beforeEach, afterEach } from "vitest";
import { setup, tear, boot, std, asset } from "./common.js";
import { cache, ctx } from "../../src/server/index.js";
import { probeAll } from "../../src/server/transform/4-probe.js";

beforeEach(setup);
afterEach(tear);

beforeEach(() => {
    std.exec.mockReturnValue(Promise.resolve({ out: "0,0,rgb" }));
});

it("parses width, height and alpha separated with comma and type from local path", async () => {
    await boot();
    std.exec.mockReturnValue(Promise.resolve({ out: "1,2,argb" }));
    asset.content.local = "foo.png";
    await probeAll([asset]);
    expect(asset.content.info).toStrictEqual({ width: 1, height: 2, alpha: true, type: "image/png" });
});

it("assumes type is unknown when local file has unknown extension", async () => {
    await boot();
    std.exec.mockReturnValue(Promise.resolve({ out: "1,2,rgb" }));
    asset.content.local = "foo.bar";
    await probeAll([asset]);
    expect(asset.content.info).toStrictEqual({ width: 1, height: 2, alpha: false, type: "unknown" });
});

it("logs ffprobe error", async () => {
    await boot();
    std.exec.mockReturnValue(Promise.resolve({ out: ",,", err: Error("foo") }));
    await probeAll([asset]);
    expect(std.log.err).toBeCalledWith("ffprobe error: foo");
});

it("uses cached probe result when asset is not dirty", async () => {
    await boot();
    const result = { width: 1, height: 2, alpha: true, type: "bar" };
    asset.dirty = false;
    asset.content.src = "foo";
    cache.probes["foo"] = result;
    await probeAll([asset]);
    expect(asset.content.info).toStrictEqual(result);
    expect(std.exec).not.toBeCalled();
});

it("reuses existing probe result with the same src", async () => {
    await boot();
    const result = { width: 1, height: 2, alpha: true, type: "bar" };
    asset.content.src = "foo";
    ctx.probes.set("foo", Promise.resolve(result));
    await probeAll([asset]);
    expect(asset.content.info).toStrictEqual(result);
    expect(std.exec).not.toBeCalled();
});

it("allows compatible plugin override behaviour", async () => {
    await boot({ plugins: [{ probe: () => true }] });
    const spy = vi.spyOn(asset.content, "info", "set");
    await probeAll([asset]);
    expect(spy).not.toBeCalled();
});

it("doesn't allow incompatible plugin override behaviour", async () => {
    await boot({ plugins: [{}, { probe: () => false }] });
    asset.content.src = "/";
    const spy = vi.spyOn(asset.content, "info", "set");
    await probeAll([asset]);
    expect(spy).toBeCalled();
});
