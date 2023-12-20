import { vi, it, expect, beforeEach, afterEach } from "vitest";
import { Global, Event, Element, SourceElement, setup, tear, ctx } from "./common.js";

declare let global: Global;
let module: typeof import("../../src/plugin/youtube/client.js");

beforeEach(() => setup(global));
afterEach(tear);

it("adds mutation handler on import", async () => {
    const addHandler = vi.spyOn(await import("../../src/client/mutation.js"), "addHandler");
    await importModule();
    expect(addHandler).toBeCalled();
});

it("queries document body on import", async () => {
    await importModule();
    expect(document.body.querySelectorAll).toBeCalled();
});

it("doesn't throw when document is not defined on import", async () => {
    delete global.document;
    await expect(importModule()).resolves.not.toThrow();
});

it("adds listener for click event on added poster and banner", async () => {
    await importModule();
    const poster = new Element("DIV");
    const banner = new Element("DIV");
    global.document!.body.querySelectorAll.mockImplementation(query =>
        query.includes(".imgit-youtube-poster") ? [poster] :
            query.includes(".imgit-youtube-banner") ? [banner] : []);
    ctx.mutation.mutate!([{ addedNodes: [global.document!.body], removedNodes: [] }]);
    expect(poster.addEventListener).toBeCalledWith("click", expect.anything());
    expect(banner.addEventListener).toBeCalledWith("click", expect.anything());
});

it("removes listener for click event on removed poster and banner", async () => {
    await importModule();
    const poster = new Element("DIV");
    const banner = new Element("DIV");
    global.document!.body.querySelectorAll.mockImplementation(query =>
        query.includes(".imgit-youtube-poster") ? [poster] :
            query.includes(".imgit-youtube-banner") ? [banner] : []);
    ctx.mutation.mutate!([{ addedNodes: [], removedNodes: [global.document!.body] }]);
    expect(poster.removeEventListener).toBeCalledWith("click", expect.anything());
    expect(banner.removeEventListener).toBeCalledWith("click", expect.anything());
});

it("opens data-href in new tab on banner click", async () => {
    await importModule();
    const banner = new Element("DIV");
    banner.dataset.href = "foo";
    let clicked: (evt: Event) => void;
    banner.addEventListener.mockImplementation((_, handler) => clicked = handler);
    global.document!.body.querySelectorAll.mockImplementation(query =>
        query.includes(".imgit-youtube-banner") ? [banner] : []);
    ctx.mutation.mutate!([{ addedNodes: [global.document!.body], removedNodes: [] }]);
    clicked!({ currentTarget: banner });
    expect(global.window.open).toBeCalledWith("foo", "_blank");
});

it("adds loading class to container, src to iframe and listens load event on poster click", async () => {
    await importModule();
    const poster = new Element("DIV");
    const iframe = new SourceElement();
    const player = new Element("DIV");
    const container = new Element("DIV");
    poster.parentElement = container;
    container.lastChild = player;
    player.firstChild = iframe;
    iframe.dataset.src = "foo";
    let clicked: (evt: Event) => void;
    poster.addEventListener.mockImplementation((_, handler) => clicked = handler);
    global.document!.body.querySelectorAll.mockImplementation(query =>
        query.includes(".imgit-youtube-poster") ? [poster] : []);
    ctx.mutation.mutate!([{ addedNodes: [global.document!.body], removedNodes: [] }]);
    clicked!({ currentTarget: poster });
    expect(container.classList.add).toBeCalledWith("imgit-youtube-loading");
    expect(iframe.src).toStrictEqual("foo");
    expect(iframe.addEventListener).toBeCalledWith("load", expect.anything());
});

it("adds playing class to container and un-hides player on iframe loaded", async () => {
    await importModule();
    const poster = new Element("DIV");
    const iframe = new SourceElement();
    const player = new Element("DIV");
    const container = new Element("DIV");
    poster.parentElement = container;
    container.lastChild = player;
    player.firstChild = iframe;
    player.parentElement = container;
    player.hidden = true;
    iframe.parentElement = player;
    iframe.dataset.src = "foo";
    let clicked: (evt: Event) => void;
    let loaded: (evt: Event) => void;
    poster.addEventListener.mockImplementation((_, handler) => clicked = handler);
    iframe.addEventListener.mockImplementation((_, handler) => loaded = handler);
    global.document!.body.querySelectorAll.mockImplementation(query =>
        query.includes(".imgit-youtube-poster") ? [poster] : []);
    ctx.mutation.mutate!([{ addedNodes: [global.document!.body], removedNodes: [] }]);
    clicked!({ currentTarget: poster });
    loaded!({ currentTarget: iframe });
    expect(container.classList.add).toBeCalledWith("imgit-youtube-playing");
    expect(player.hidden).toBeFalsy();
});

async function importModule(): Promise<void> {
    module = await import("../../src/plugin/youtube/client.js");
}
