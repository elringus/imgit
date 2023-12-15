import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock browser API subset used by the tested client code.
declare module global {
    let window: {
        navigator: { userAgent: string },
        MutationObserver?: {},
        IntersectionObserver?: {}
    };
    let document: { body: Element } | undefined;
    let MutationObserver: typeof MutationObserverMock;
    let IntersectionObserver: typeof IntersectionObserverMock;
}

// https://developer.mozilla.org/docs/Web/API/Node
class Node {}

// https://developer.mozilla.org/docs/Web/API/HTMLElement
class Element extends Node {
    public children: Element[] = [];
    public dataset: { [name: string]: string } = {};
    constructor(public tagName: string) { super(); }
    addEventListener = vi.fn();
    removeEventListener = vi.fn();
    querySelectorAll = vi.fn(() => []);
    closest = vi.fn();
}

// https://developer.mozilla.org/docs/Web/API/HTMLVideoElement
class ImageElement extends Element {
    public complete: boolean = false;
    public naturalHeight: number = 0;
    constructor() { super("IMG"); }
}

// https://developer.mozilla.org/docs/Web/API/HTMLVideoElement
class VideoElement extends Element {
    constructor() { super("VIDEO"); }
    load = vi.fn();
}

// https://developer.mozilla.org/docs/Web/API/HTMLSourceElement
class SourceElement extends Element {
    public src = "";
    public type = "";
    constructor() { super("SOURCE"); }
}

// https://developer.mozilla.org/docs/Web/API/MutationObserver
class MutationObserverMock {
    constructor(handle: (records: MutationRecord[], observer: MutationObserverMock) => void) {
        ctx.mutation.observer = this;
        ctx.mutation.mutate = records => handle(records, this);
    }
    observe = vi.fn();
}

// https://developer.mozilla.org/docs/Web/API/MutationRecord
declare type MutationRecord = {
    readonly addedNodes: Node[];
    readonly removedNodes: Node[];
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
    readonly target: Element;
}

const ctx: {
    mutation: {
        observer?: MutationObserverMock,
        mutate?: (entries: MutationRecord[]) => void
    },
    intersection: {
        observer?: IntersectionObserverMock,
        intersect?: (entries: IntersectionObserverEntry[]) => void
    }
} = { mutation: {}, intersection: {} };

beforeEach(() => {
    global.window = {
        navigator: { userAgent: "" },
        MutationObserver: MutationObserverMock,
        IntersectionObserver: IntersectionObserverMock
    };
    global.document = { body: new Element("BODY") };
    global.MutationObserver = vi.fn(handle => new MutationObserverMock(handle));
    global.IntersectionObserver = vi.fn(handle => new IntersectionObserverMock(handle));
});

afterEach(() => void vi.resetModules());

describe("index", () => {
    it("observes mutations on import", async () => {
        const observe = vi.spyOn(await import("../src/client/mutation.js"), "observeMutations");
        await import("../src/client/index.js");
        expect(observe).toBeCalled();
    });
});

describe("mutation", async () => {
    it("doesn't throw when attempting to observe while document is not defined", async () => {
        delete global.document;
        const module = await import("../src/client/mutation.js");
        expect(() => module.observeMutations()).not.toThrow();
        expect(MutationObserver).not.toBeCalled();
    });

    it("doesn't throw when attempting to observe while MutationObserver is not in window", async () => {
        delete global.window.MutationObserver;
        const module = await import("../src/client/mutation.js");
        expect(() => module.observeMutations()).not.toThrow();
        expect(MutationObserver).not.toBeCalled();
    });

    it("observes and queries body when window and MutationObserver are available", async () => {
        const module = await import("../src/client/mutation.js");
        module.observeMutations();
        expect(MutationObserver).toBeCalled();
        expect(ctx.mutation.observer!.observe).toBeCalledWith(document.body, expect.anything());
        expect(document.body.querySelectorAll).toBeCalled();
    });
});

describe("intersection", async () => {
    it("doesn't throw when attempting to observe while document is not defined", async () => {
        delete global.document;
        const module = await import("../src/client/intersection.js");
        expect(() => module.observeVideo(<never>{})).not.toThrow();
        expect(() => module.unobserveVideo(<never>{})).not.toThrow();
        expect(IntersectionObserver).not.toBeCalled();
    });

    it("doesn't throw when attempting to observe while IntersectionObserver is not in window", async () => {
        delete global.window.IntersectionObserver;
        const module = await import("../src/client/intersection.js");
        expect(() => module.observeVideo(<never>{})).not.toThrow();
        expect(() => module.unobserveVideo(<never>{})).not.toThrow();
        expect(IntersectionObserver).not.toBeCalled();
    });

    it("creates observer on import when window and IntersectionObserver are available", async () => {
        await import("../src/client/intersection.js");
        expect(IntersectionObserver).toBeCalled();
    });

    it("invokes observe and unobserve when requested", async () => {
        const module = await import("../src/client/intersection.js");
        const video = new VideoElement();
        module.observeVideo(<never>video);
        module.unobserveVideo(<never>video);
        expect(ctx.intersection.observer!.observe).toBeCalledWith(video);
        expect(ctx.intersection.observer!.unobserve).toBeCalledWith(video);
    });

    it("assigns src from data-imgit-src attribute and loads video when intersected", async () => {
        await import("../src/client/intersection.js");
        const source = new SourceElement();
        source.dataset.imgitSrc = "x";
        const video = new VideoElement();
        video.children.push(source);
        ctx.intersection.intersect!([{ target: video, isIntersecting: true }]);
        expect(source.src).toStrictEqual("x");
        expect(video.load).toBeCalled();
    });

    it("doesn't assign av1 source, but still loads the video on edge (workaround for edge bug)", async () => {
        global.window.navigator.userAgent = "Edg/";
        await import("../src/client/intersection.js");
        const source = new SourceElement();
        source.dataset.imgitSrc = "x";
        source.type = "video/mp4; codecs=av01";
        const video = new VideoElement();
        video.children.push(source);
        ctx.intersection.intersect!([{ target: video, isIntersecting: true }]);
        expect(source.src).toStrictEqual("");
        expect(video.load).toBeCalled();
    });
});
