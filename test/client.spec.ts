// @vitest-environment happy-dom

import { describe, it, expect, vi, beforeEach } from "vitest";

declare module global {
    let window: unknown;
    let document: unknown;
    let MutationObserver: unknown;
    let IntersectionObserver: unknown;
}

beforeEach(() => void vi.resetModules());

describe("index", () => {
    it("observes mutations on import", async () => {
        const observe = vi.spyOn(await import("../src/client/mutation.js"), "observeMutations");
        await import("../src/client/index.js");
        expect(observe).toHaveBeenCalled();
    });
});

describe("intersections", async () => {
    beforeEach(() => {
        global.window = { navigator: { userAgent: "" }, IntersectionObserver: {} };
        global.document = {};
        global.IntersectionObserver = vi.fn();
    });

    it("doesn't throw when attempting to observe while document is not defined", async () => {
        global.document = undefined;
        const module = await import("../src/client/intersection.js");
        expect(() => module.observeVideo(<never>{})).not.toThrow();
        expect(() => module.unobserveVideo(<never>{})).not.toThrow();
        expect(IntersectionObserver).not.toHaveBeenCalled();
    });

    it("doesn't throw when attempting to observe while IntersectionObserver is not in window", async () => {
        global.window = { navigator: { userAgent: "" } };
        const module = await import("../src/client/intersection.js");
        expect(() => module.observeVideo(<never>{})).not.toThrow();
        expect(() => module.unobserveVideo(<never>{})).not.toThrow();
        expect(IntersectionObserver).not.toHaveBeenCalled();
    });

    it("creates observer on import when window and IntersectionObserver are available", async () => {
        await import("../src/client/intersection.js");
        expect(IntersectionObserver).toHaveBeenCalled();
    });

    // it("assigns src from data-src attribute for intersected video sources", async () => {
    //     const module = await import("../src/client/intersection.js");
    //     const source = { src: undefined, dataset: { imgitSrc: "foo" } };
    //     module.observeVideo(<never>{ load: vi.fn(), children: [source] });
    //     expect(source.src).toStrictEqual("foo");
    // });
});
