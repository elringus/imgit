import { it, expect, vi, beforeEach, afterEach } from "vitest";
import { setup, tear, boot, asset } from "./common.js";
import { resolveAll } from "../../src/server/transform/2-resolve.js";

beforeEach(setup);
afterEach(tear);

it("resolves content src as syntax url", async () => {
    await boot();
    const assets = await resolveAll([{ ...asset, syntax: { ...asset.syntax, url: "foo" } }]);
    expect(assets[0].content.src).toStrictEqual("foo");
});

it("resolves spec to empty object when syntax spec is undefined", async () => {
    await boot();
    const assets = await resolveAll([{ ...asset, syntax: { ...asset.syntax, spec: undefined } }]);
    expect(assets[0].spec).toStrictEqual({});
});

it("parses captured spec syntax as URL query", async () => {
    await boot();
    const spec = `?width=1&eager&merge&media=(foo)&class=bar`;
    const assets = await resolveAll([{ ...asset, syntax: { ...asset.syntax, spec } }]);
    expect(assets[0].spec).toStrictEqual({
        eager: true, merge: true, width: 1,
        media: "(foo)", class: "bar"
    });
});

it("resolves spec options to undefined when URL query is missing associated params", async () => {
    await boot();
    const assets = await resolveAll([{ ...asset, syntax: { ...asset.syntax, spec: "?" } }]);
    expect(assets[0].spec).toStrictEqual({
        eager: undefined, merge: undefined, width: undefined,
        media: undefined, class: undefined
    });
});

it("compatible plugin overrides built-in behaviour", async () => {
    await boot({ plugins: [{ resolve: () => true }] });
    const spy = vi.spyOn(asset, "content", "set");
    await resolveAll([asset]);
    expect(spy).not.toBeCalled();
});

it("incompatible plugins don't override built-in behaviour", async () => {
    await boot({ plugins: [{}, { resolve: () => false }] });
    const spy = vi.spyOn(asset, "content", "set");
    await resolveAll([asset]);
    expect(spy).toBeCalled();
});
