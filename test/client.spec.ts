import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock browser API subset used by the tested client code.
declare module global {
    let window: {
        navigator: { userAgent: string },
        IntersectionObserver?: {}
    };
    let document: {} | undefined;
    let IntersectionObserver: typeof IntersectionObserverMock;
}

// https://developer.mozilla.org/docs/Web/API/HTMLElement
declare type HTMLElement = {
    children: HTMLElement[];
    dataset: DOMStringMap;
}

// https://developer.mozilla.org/docs/Web/API/HTMLSourceElement
declare type HTMLSourceElement = HTMLElement & {
    src: string;
    type: string
}

// https://developer.mozilla.org/docs/Web/API/HTMLVideoElement
declare type HTMLVideoElement = HTMLElement & {
    load: () => void;
}

// https://developer.mozilla.org/docs/Web/API/IntersectionObserver
class IntersectionObserverMock {
    constructor(handle: (entries: IntersectionObserverEntry[], observer: IntersectionObserverMock) => void) {
        ctx.intersection.observer = this;
        ctx.intersection.intersect = entries => handle(entries, this);
    }
    observe = vi.fn();
    unobserve = vi.fn();
}

// https://developer.mozilla.org/docs/Web/API/IntersectionObserverEntry
declare type IntersectionObserverEntry = {
    readonly isIntersecting: boolean;
    readonly target: HTMLElement;
}

const ctx: {
    intersection: {
        observer?: IntersectionObserverMock,
        intersect?: (entries: IntersectionObserverEntry[]) => void
    },
} = { intersection: {} };

beforeEach(() => {
    global.window = {
        navigator: { userAgent: "" },
        IntersectionObserver: IntersectionObserverMock
    };
    global.document = {};
    global.IntersectionObserver = vi.fn(handle => new IntersectionObserverMock(handle));
});

afterEach(() => void vi.resetModules());

describe("index", () => {
    it("observes mutations on import", async () => {
        const observe = vi.spyOn(await import("../src/client/mutation.js"), "observeMutations");
        await import("../src/client/index.js");
        expect(observe).toHaveBeenCalled();
    });
});

describe("intersections", async () => {
    it("doesn't throw when attempting to observe while document is not defined", async () => {
        delete global.document;
        const module = await import("../src/client/intersection.js");
        expect(() => module.observeVideo(<never>{})).not.toThrow();
        expect(() => module.unobserveVideo(<never>{})).not.toThrow();
        expect(IntersectionObserver).not.toHaveBeenCalled();
    });

    it("doesn't throw when attempting to observe while IntersectionObserver is not in window", async () => {
        delete global.window.IntersectionObserver;
        const module = await import("../src/client/intersection.js");
        expect(() => module.observeVideo(<never>{})).not.toThrow();
        expect(() => module.unobserveVideo(<never>{})).not.toThrow();
        expect(IntersectionObserver).not.toHaveBeenCalled();
    });

    it("creates observer on import when window and IntersectionObserver are available", async () => {
        await import("../src/client/intersection.js");
        expect(IntersectionObserver).toHaveBeenCalled();
    });

    it("invokes observe and unobserve when requested", async () => {
        const module = await import("../src/client/intersection.js");
        const video: HTMLVideoElement = { load: vi.fn(), dataset: {}, children: [] };
        module.observeVideo(<never>video);
        module.unobserveVideo(<never>video);
        expect(ctx.intersection.observer!.observe).toHaveBeenCalledWith(video);
        expect(ctx.intersection.observer!.unobserve).toHaveBeenCalledWith(video);
    });

    it("assigns src from data-src attribute and loads video when intersected", async () => {
        const module = await import("../src/client/intersection.js");
        const source: HTMLSourceElement = { src: "", dataset: { imgitSrc: "x" }, type: "", children: [] };
        const video: HTMLVideoElement = { load: vi.fn(), dataset: {}, children: [source] };
        module.observeVideo(<never>video);
        ctx.intersection.intersect!([{ target: video, isIntersecting: true }]);
        expect(source.src).toStrictEqual("x");
        expect(video.load).toHaveBeenCalled();
    });

    it("doesn't assign av1 source, but still loads the video on edge (workaround for edge bug)", async () => {
        global.window.navigator.userAgent = "Edg/";
        const module = await import("../src/client/intersection.js");
        const source: HTMLSourceElement = { src: "", dataset: { imgitSrc: "x" }, type: "codecs=av01", children: [] };
        const video: HTMLVideoElement = { load: vi.fn(), dataset: {}, children: [source] };
        module.observeVideo(<never>video);
        ctx.intersection.intersect!([{ target: video, isIntersecting: true }]);
        expect(source.src).toStrictEqual("");
        expect(video.load).toHaveBeenCalled();
    });
});
