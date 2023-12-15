// @vitest-environment happy-dom

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Window } from "happy-dom";

declare module global {
    let window: Window & { IntersectionObserver: never };
    let document: Document;
    let MutationObserver: MutationObserver;
    let IntersectionObserver: IntersectionObserver;
}

beforeEach(() => {
    global.window = <never>new Window();
    global.document = window.document;
});

afterEach(() => {
    global.window.happyDOM.cancelAsync();
    vi.resetModules();
});

describe("index", () => {
    it("observes mutations on import", async () => {
        const observe = vi.spyOn(await import("../src/client/mutation.js"), "observeMutations");
        await import("../src/client/index.js");
        expect(observe).toHaveBeenCalled();
    });
});

describe("intersections", async () => {
    let observer: IntersectionObserver;
    let intersect: (entries: IntersectionObserverEntry[]) => void;

    beforeEach(() => {
        global.IntersectionObserver = global.window.IntersectionObserver = <never>vi.fn(handle => {
            intersect = entries => handle(entries, observer);
            return observer = <never>{ observe: vi.fn(), unobserve: vi.fn() };
        });
    });

    it("doesn't throw when attempting to observe while document is not defined", async () => {
        global.document = <never>undefined;
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
        const video = document.createElement("video");
        module.observeVideo(video);
        module.unobserveVideo(video);
        expect(observer.observe).toHaveBeenCalledWith(video);
        expect(observer.unobserve).toHaveBeenCalledWith(video);
    });

    it("assigns src from data-src attribute for intersected video sources", async () => {
        const module = await import("../src/client/intersection.js");
        const video = document.createElement("video");
        const source = document.createElement("source");
        source.src = "";
        source.dataset.imgitSrc = "foo";
        video.appendChild(source);
        module.observeVideo(video);
        intersect([<never>{ target: video, isIntersecting: true }]);
        expect(source.src).toStrictEqual("foo");
    });

    it("doesn't assign av1 source on edge (workaround for edge bug)", async () => {
        global.window.happyDOM.settings.navigator.userAgent = "Edg/";
        const module = await import("../src/client/intersection.js");
        const video = document.createElement("video");
        const source = document.createElement("source");
        source.src = "";
        source.dataset.imgitSrc = "foo";
        source.type = `video/mp4; codecs=av01`;
        video.appendChild(source);
        module.observeVideo(video);
        intersect([<never>{ target: video, isIntersecting: true }]);
        expect(source.src).toStrictEqual("");
    });
});
