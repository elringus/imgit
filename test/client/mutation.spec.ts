import { vi, it, expect, beforeEach, afterEach } from "vitest";
import { Global, Event, Node, Element, ImageElement, VideoElement, setup, ctx } from "./common.js";

declare let global: Global;
let module: typeof import("../../src/client/mutation.js");

beforeEach(() => setup(global));
afterEach(() => void vi.resetModules());

it("doesn't throw when attempting to observe while document is not defined", async () => {
    delete global.document;
    await importModule();
    expect(() => module.observeMutations()).not.toThrow();
    expect(MutationObserver).not.toBeCalled();
});

it("doesn't throw when attempting to observe while MutationObserver is not in window", async () => {
    delete global.window.MutationObserver;
    await importModule();
    expect(() => module.observeMutations()).not.toThrow();
    expect(MutationObserver).not.toBeCalled();
});

it("observes and queries body when window and MutationObserver are available", async () => {
    await importModule();
    module.observeMutations();
    expect(MutationObserver).toBeCalled();
    expect(ctx.mutation.observer!.observe).toBeCalledWith(document.body, expect.anything());
    expect(document.body.querySelectorAll).toBeCalled();
});

it("invokes custom handlers on mutation", async () => {
    await importModule();
    const added = vi.fn();
    const removed = vi.fn();
    module.addHandler([added, removed]);
    ctx.mutation.mutate!([{ addedNodes: [document.body], removedNodes: [document.body] }]);
    expect(added).toBeCalledWith(document.body);
    expect(removed).toBeCalledWith(document.body);
});

it("ignores non-element node mutation", async () => {
    await importModule();
    const node = new Node();
    const added = vi.fn();
    const removed = vi.fn();
    module.addHandler([added, removed]);
    ctx.mutation.mutate!([{ addedNodes: [node], removedNodes: [node] }]);
    expect(added).not.toBeCalled();
    expect(removed).not.toBeCalled();
});

it("adds listener for load event on added unloaded images", async () => {
    await importModule();
    const img = new ImageElement();
    global.document!.body.querySelectorAll.mockReturnValue([img]);
    ctx.mutation.mutate!([{ addedNodes: [global.document!.body], removedNodes: [] }]);
    expect(img.addEventListener).toBeCalledWith("load", expect.anything());
});

it("removes listener for load event on removed images", async () => {
    await importModule();
    const img = new ImageElement();
    let loaded: (evt: Event) => void;
    img.addEventListener.mockImplementation((_, handler) => loaded = handler);
    global.document!.body.querySelectorAll.mockReturnValue([img]);
    ctx.mutation.mutate!([{ addedNodes: [global.document!.body], removedNodes: [] }]);
    ctx.mutation.mutate!([{ addedNodes: [], removedNodes: [global.document!.body] }]);
    expect(img.removeEventListener).toBeCalledWith("load", loaded!);
});

it("assigns loaded attribute to closest container when listened image loads", async () => {
    await importModule();
    const container = new Element("DIV");
    const img = new ImageElement();
    let loaded: (evt: Event) => void;
    img.addEventListener.mockImplementation((_, handler) => loaded = handler);
    img.closest.mockReturnValue(container);
    global.document!.body.querySelectorAll.mockReturnValue([img]);
    ctx.mutation.mutate!([{ addedNodes: [global.document!.body], removedNodes: [] }]);
    loaded!({ currentTarget: img });
    expect(container.dataset.imgitLoaded).toBeDefined();
});

it("doesn't throw when loaded image event missing target or target is not element", async () => {
    await importModule();
    const container = new Element("DIV");
    const img = new ImageElement();
    let loaded: (evt: Event) => void;
    img.addEventListener.mockImplementation((_, handler) => loaded = handler);
    img.closest.mockReturnValue(container);
    global.document!.body.querySelectorAll.mockReturnValue([img]);
    ctx.mutation.mutate!([{ addedNodes: [global.document!.body], removedNodes: [] }]);
    expect(() => loaded!({ currentTarget: undefined })).not.toThrow();
    expect(() => loaded!({ currentTarget: new Node() })).not.toThrow();
});

it("assigns loaded attribute to closest container on added loaded images", async () => {
    await importModule();
    const container = new Element("DIV");
    const img = new ImageElement();
    img.complete = true;
    img.naturalHeight = 1;
    img.closest.mockReturnValue(container);
    global.document!.body.querySelectorAll.mockReturnValue([img]);
    ctx.mutation.mutate!([{ addedNodes: [global.document!.body], removedNodes: [] }]);
    expect(img.addEventListener).not.toBeCalledWith("load", expect.anything());
    expect(container.dataset.imgitLoaded).toBeDefined();
});

it("when no closest container, doesn't throw", async () => {
    await importModule();
    const img = new ImageElement();
    img.complete = true;
    img.naturalHeight = 1;
    global.document!.body.querySelectorAll.mockReturnValue([img]);
    expect(() => ctx.mutation.mutate!([{ addedNodes: [global.document!.body], removedNodes: [] }]))
    .not.toThrow();
});

it("observers intersection on added videos", async () => {
    await importModule();
    const observe = vi.spyOn(await import("../../src/client/intersection.js"), "observeVideo");
    const video = new VideoElement();
    global.document!.body.querySelectorAll.mockReturnValue([video]);
    ctx.mutation.mutate!([{ addedNodes: [global.document!.body], removedNodes: [] }]);
    expect(observe).toBeCalledWith(video);
});

it("un-observers intersection on removed videos", async () => {
    await importModule();
    const unobserve = vi.spyOn(await import("../../src/client/intersection.js"), "unobserveVideo");
    const video = new VideoElement();
    global.document!.body.querySelectorAll.mockReturnValue([video]);
    ctx.mutation.mutate!([{ addedNodes: [], removedNodes: [global.document!.body] }]);
    expect(unobserve).toBeCalledWith(video);
});

it("adds listener for load event on added unloaded videos", async () => {
    await importModule();
    const video = new VideoElement();
    global.document!.body.querySelectorAll.mockReturnValue([video]);
    ctx.mutation.mutate!([{ addedNodes: [global.document!.body], removedNodes: [] }]);
    expect(video.addEventListener).toBeCalledWith("loadeddata", expect.anything());
});

it("removes listener for load event on removed videos", async () => {
    await importModule();
    const video = new VideoElement();
    let loaded: (evt: Event) => void;
    video.addEventListener.mockImplementation((_, handler) => loaded = handler);
    global.document!.body.querySelectorAll.mockReturnValue([video]);
    ctx.mutation.mutate!([{ addedNodes: [global.document!.body], removedNodes: [] }]);
    ctx.mutation.mutate!([{ addedNodes: [], removedNodes: [global.document!.body] }]);
    expect(video.removeEventListener).toBeCalledWith("loadeddata", loaded!);
});

it("assigns loaded attribute to closest container when listened video loads", async () => {
    await importModule();
    const container = new Element("DIV");
    const video = new VideoElement();
    let loaded: (evt: Event) => void;
    video.addEventListener.mockImplementation((_, handler) => loaded = handler);
    video.closest.mockReturnValue(container);
    global.document!.body.querySelectorAll.mockReturnValue([video]);
    ctx.mutation.mutate!([{ addedNodes: [global.document!.body], removedNodes: [] }]);
    loaded!({ currentTarget: video });
    expect(container.dataset.imgitLoaded).toBeDefined();
});

it("assigns loaded attribute to closest container on added loaded videos", async () => {
    await importModule();
    const container = new Element("DIV");
    const img = new VideoElement();
    img.readyState = 2;
    img.closest.mockReturnValue(container);
    global.document!.body.querySelectorAll.mockReturnValue([img]);
    ctx.mutation.mutate!([{ addedNodes: [global.document!.body], removedNodes: [] }]);
    expect(img.addEventListener).not.toBeCalledWith("loadeddata", expect.anything());
    expect(container.dataset.imgitLoaded).toBeDefined();
});

async function importModule(): Promise<void> {
    module = await import("../../src/client/mutation.js");
}
