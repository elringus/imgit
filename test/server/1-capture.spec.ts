import { it, expect, beforeEach, afterEach } from "vitest";
import { setup, tear, boot } from "./common.js";
import { captureAll } from "../../src/server/transform/1-capture.js";

beforeEach(setup);
afterEach(tear);

it("captures markdown syntax by default", async () => {
    await boot();
    const assets = await captureAll("", "![alt?spec](url)");
    expect(assets).toHaveLength(1);
    expect(assets[0].syntax).toStrictEqual({
        text: "![alt?spec](url)", index: 0,
        url: "url", alt: "alt", spec: "?spec"
    });
});

it("captures syntax with custom regex", async () => {
    await boot({ regex: [/<Imgit.*url="(?<url>.+?)".*\/>/g] });
    const assets = await captureAll("", `![](foo)<Imgit url="bar"/>`);
    expect(assets).toHaveLength(1);
    expect(assets[0].syntax).toStrictEqual({
        text: `<Imgit url="bar"/>`, index: 8,
        url: "bar", alt: undefined, spec: undefined
    });
});

it("captures syntax with multiple regex", async () => {
    await boot({ regex: [/!\[]\((?<url>.+?)\)/g, /<Imgit.*url="(?<url>.+?)".*\/>/g] });
    const assets = await captureAll("", `![](foo)<Imgit url="bar"/>`);
    expect(assets).toHaveLength(2);
    expect(assets[0].syntax).toStrictEqual({
        text: `![](foo)`, index: 0,
        url: "foo", alt: undefined, spec: undefined
    });
    expect(assets[1].syntax).toStrictEqual({
        text: `<Imgit url="bar"/>`, index: 8,
        url: "bar", alt: undefined, spec: undefined
    });
});

it("compatible plugin overrides built-in behaviour", async () => {
    await boot({ plugins: [{ capture: () => true }] });
    const assets = await captureAll("", "![](url)");
    expect(assets).toHaveLength(0);
});

it("incompatible plugins don't override built-in behaviour", async () => {
    await boot({ plugins: [{}, { capture: () => false }] });
    const assets = await captureAll("", "![](url)");
    expect(assets).toHaveLength(1);
});
