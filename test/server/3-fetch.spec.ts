import { it, expect, vi, beforeEach, afterEach } from "vitest";
import { setup, tear, boot, std, asset } from "./common.js";
import { cache, ctx } from "../../src/server/index.js";
import { fetchAll } from "../../src/server/transform/3-fetch.js";

beforeEach(setup);
afterEach(tear);

beforeEach(() => {
    std.fetch.mockReturnValue(<never>Promise.resolve({
        status: 200,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0))
    } satisfies Partial<Response>));
});

it("resolves local path from configured root for assets with relative src", async () => {
    await boot({ root: "./root" });
    std.path.resolve.mockImplementation(p => p === "./root" ? "root" : "");
    asset.content.src = "/baz.png";
    await fetchAll([asset]);
    expect(asset.content.local).toStrictEqual("root/baz.png");
});

it("resolves local path from configured fetch root for assets with absolute src", async () => {
    await boot({ fetch: { root: "./fetched" } });
    std.path.resolve.mockImplementation(p => p === "./fetched" ? "fetched" : "");
    asset.content.src = "http://host.name/dir/file.ext";
    await fetchAll([asset]);
    expect(asset.content.local).toStrictEqual("fetched/host.name-dir-file.ext");
});

it("assumes asset dirty when local file doesn't exist", async () => {
    await boot();
    asset.content.src = "http://host.name/file.png";
    std.fs.exists.mockReturnValue(Promise.resolve(false));
    await fetchAll([asset]);
    expect(asset.dirty).toBeTruthy();
});

it("assumes asset dirty when local file exist, but sizes cache record is missing", async () => {
    await boot();
    asset.content.src = "http://host.name/file.png";
    std.fs.exists.mockReturnValue(Promise.resolve(true));
    delete cache.sizes[asset.content.src];
    await fetchAll([asset]);
    expect(asset.dirty).toBeTruthy();
});

it("assumes asset dirty when local file exist and size cached, but actual size differs", async () => {
    await boot();
    asset.content.src = "http://host.name/file.png";
    std.fs.exists.mockReturnValue(Promise.resolve(true));
    cache.sizes[asset.content.src] = 1;
    std.fs.size.mockReturnValue(Promise.resolve(2));
    await fetchAll([asset]);
    expect(asset.dirty).toBeTruthy();
});

it("assumes asset not dirty when local file exist and cached size is actual", async () => {
    await boot();
    asset.content.src = "http://host.name/file.png";
    std.fs.exists.mockReturnValue(Promise.resolve(true));
    cache.sizes[asset.content.src] = 1;
    std.fs.size.mockReturnValue(Promise.resolve(1));
    await fetchAll([asset]);
    expect(asset.dirty).toBeFalsy();
});

it("doesn't fetch assets that are not dirty", async () => {
    await boot();
    asset.content.src = "http://host.name/file.png";
    std.fs.exists.mockReturnValue(Promise.resolve(true));
    cache.sizes[asset.content.src] = 1;
    std.fs.size.mockReturnValue(Promise.resolve(1));
    await fetchAll([asset]);
    expect(std.fetch).not.toBeCalled();
});

it("doesn't fetch assets with local src", async () => {
    await boot();
    asset.content.src = "/foo.png";
    await fetchAll([asset]);
    expect(std.fetch).not.toBeCalled();
});

it("reuses fetches with same src", async () => {
    await boot();
    ctx.fetches.set("http://host.name/file.png", Promise.resolve());
    asset.content.src = "http://host.name/file.png";
    asset.dirty = true;
    await fetchAll([asset]);
    expect(std.fetch).not.toBeCalled();
});

it("stores fetch promise in context", async () => {
    await boot();
    asset.content.src = "http://host.name/file.png";
    await fetchAll([asset]);
    expect(ctx.fetches.has(asset.content.src)).toBeTruthy();
});

it("creates dir for downloaded file when necessary", async () => {
    await boot();
    asset.content.src = "http://host.name/file.png";
    std.path.dirname.mockReturnValue("foo");
    await fetchAll([asset]);
    expect(std.fs.mkdir).toBeCalledWith("foo");
});

it("writes downloaded file to fetch root dir", async () => {
    await boot();
    std.path.resolve.mockReturnValue("root");
    asset.content.src = "http://host.name/file.png";
    await fetchAll([asset]);
    expect(std.fs.write).toBeCalledWith("root/host.name-file.png", expect.anything());
});

it("caches fetched file size", async () => {
    await boot();
    asset.content.src = "http://host.name/file.png";
    std.fs.size.mockReturnValue(Promise.resolve(7));
    await fetchAll([asset]);
    expect(cache.sizes[asset.content.src]).toStrictEqual(7);
});

it("retries failed fetches up to the limit specified in config, then throws", async () => {
    await boot({ fetch: { retries: 2 } });
    asset.content.src = "http://host.name/file.png";
    std.fetch.mockReturnValue(Promise.reject("foo"));
    await expect(fetchAll([asset])).rejects.toThrow("foo");
    expect(std.fetch).toHaveBeenCalledTimes(3);
});

it("handles retry response", async () => {
    await boot();
    asset.content.src = "http://host.name/file.png";
    std.fetch.mockReturnValueOnce(<never>Promise.resolve({
        status: 429,
        headers: <never>new Map([["retry-after", "10"]])
    } satisfies Partial<Response>));
    await fetchAll([asset]);
    expect(std.wait).toBeCalledWith(10);
    expect(std.fetch).toHaveBeenCalledTimes(2);
});

it("throws when retry response misses retry-after header", async () => {
    await boot({ fetch: { retries: 0 } });
    asset.content.src = "http://host.name/file.png";
    std.fetch.mockReturnValueOnce(<never>Promise.resolve({
        status: 429,
        headers: <never>new Map([])
    } satisfies Partial<Response>));
    await expect(fetchAll([asset])).rejects.toThrow(/429 without retry-after header/);
});

it("throws when retry response's retry-after header is not a number", async () => {
    await boot({ fetch: { retries: 0 } });
    asset.content.src = "http://host.name/file.png";
    std.fetch.mockReturnValueOnce(<never>Promise.resolve({
        status: 429,
        headers: <never>new Map([["retry-after", "later"]])
    } satisfies Partial<Response>));
    await expect(fetchAll([asset])).rejects.toThrow(/429 without retry-after header/);
});

it("compatible plugin overrides built-in behaviour", async () => {
    await boot({ plugins: [{ fetch: () => true }] });
    const spy = vi.spyOn(asset.content, "local", "set");
    await fetchAll([asset]);
    expect(spy).not.toBeCalled();
});

it("incompatible plugins don't override built-in behaviour", async () => {
    await boot({ plugins: [{}, { fetch: () => false }] });
    asset.content.src = "/";
    const spy = vi.spyOn(asset.content, "local", "set");
    await fetchAll([asset]);
    expect(spy).toBeCalled();
});
