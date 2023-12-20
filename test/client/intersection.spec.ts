import { it, expect, beforeEach, afterEach } from "vitest";
import { Global, VideoElement, SourceElement, setup, tear, ctx } from "./common.js";

declare let global: Global;
let module: typeof import("../../src/client/intersection.js");

beforeEach(() => setup(global));
afterEach(tear);

it("doesn't throw when attempting to observe while document is not defined", async () => {
    delete global.document;
    await importModule();
    expect(() => module.observeVideo(<never>{})).not.toThrow();
    expect(() => module.unobserveVideo(<never>{})).not.toThrow();
    expect(IntersectionObserver).not.toBeCalled();
});

it("doesn't throw when attempting to observe while IntersectionObserver is not in window", async () => {
    delete global.window.IntersectionObserver;
    await importModule();
    expect(() => module.observeVideo(<never>{})).not.toThrow();
    expect(() => module.unobserveVideo(<never>{})).not.toThrow();
    expect(IntersectionObserver).not.toBeCalled();
});

it("creates observer on import when window and IntersectionObserver are available", async () => {
    await importModule();
    expect(IntersectionObserver).toBeCalled();
});

it("invokes observe and unobserve when requested", async () => {
    await importModule();
    const video = new VideoElement();
    module.observeVideo(<never>video);
    module.unobserveVideo(<never>video);
    expect(ctx.intersection.observer!.observe).toBeCalledWith(video);
    expect(ctx.intersection.observer!.unobserve).toBeCalledWith(video);
});

it("assigns src from data-imgit-src attribute and loads video when intersected", async () => {
    await importModule();
    const source = new SourceElement();
    source.dataset.imgitSrc = "x";
    const video = new VideoElement();
    video.children.push(source);
    ctx.intersection.intersect!([{ target: video, isIntersecting: true }]);
    expect(source.src).toStrictEqual("x");
    expect(video.load).toBeCalled();
});

it("doesn't assign av1 source, but loads the video on edge (workaround for edge bug)", async () => {
    global.window.navigator.userAgent = "Edg/";
    await importModule();
    const source = new SourceElement();
    source.dataset.imgitSrc = "x";
    source.type = "video/mp4; codecs=av01";
    const video = new VideoElement();
    video.children.push(source);
    ctx.intersection.intersect!([{ target: video, isIntersecting: true }]);
    expect(source.src).toStrictEqual("");
    expect(video.load).toBeCalled();
});

async function importModule(): Promise<void> {
    module = await import("../../src/client/intersection.js");
}
