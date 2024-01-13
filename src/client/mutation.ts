import { observeVideo, unobserveVideo } from "./intersection.js";

const IMAGE_LOADED_EVENT = "load";
const VIDEO_LOADED_EVENT = "loadeddata";

/** External mutation handler. First tuple hook is invoked when an element is added
 *  to HTML document; second one — when removed. */
export type Handler = [(added: Element) => void, (removed: Element) => void];

const observer = canObserve() ? new MutationObserver(handleMutations) : undefined;
const handlers: Array<Handler> = [];

/** Starts observing HTML document for changes. Required by imgit to lazy-load
 *  elements added dynamically, eg in single-page apps (SPA). */
export function observeMutations() {
    observer?.observe(document.body, { childList: true, subtree: true });
    if (canObserve()) handleAdded(document.body);
}

/** Adds custom handler for HTML document changes. Can be used by plugins
 *  to share the imgit observer instance. */
export function addHandler(handler: Handler) {
    handlers.push(handler);
}

function canObserve() {
    return typeof document === "object" && "MutationObserver" in window;
}

function handleMutations(mutations: MutationRecord[]) {
    for (const mutation of mutations)
        handleMutation(mutation);
}

function handleMutation(mutation: MutationRecord) {
    for (const node of mutation.addedNodes)
        if (isElement(node)) handleAdded(node);
    for (const node of mutation.removedNodes)
        if (isElement(node)) handleRemoved(node);
}

function handleAdded(added: Element) {
    for (const element of added.querySelectorAll("[data-imgit-loadable]"))
        if (isImage(element)) handleImageAdded(element);
        else if (isVideo(element)) handleVideoAdded(element);
    for (const handler of handlers)
        handler[0](added);
}

function handleImageAdded(image: HTMLImageElement) {
    // Height check is a hack for firefox, which returns false-positive on complete.
    if (image.complete && image.naturalHeight > 0) signalLoaded(image);
    else image.addEventListener(IMAGE_LOADED_EVENT, handleLoaded);
}

function handleVideoAdded(video: HTMLVideoElement) {
    observeVideo(video);
    if (video.readyState >= 2) signalLoaded(video);
    else video.addEventListener(VIDEO_LOADED_EVENT, handleLoaded);
}

function handleRemoved(removed: Element) {
    for (const element of removed.querySelectorAll("[data-imgit-loadable]")) {
        if (isVideo(element)) unobserveVideo(element);
        element.removeEventListener(IMAGE_LOADED_EVENT, handleLoaded);
        element.removeEventListener(VIDEO_LOADED_EVENT, handleLoaded);
    }
    for (const handler of handlers)
        handler[1](removed);
}

function handleLoaded(event: Event) {
    if (event.currentTarget && isElement(event.currentTarget))
        signalLoaded(event.currentTarget);
}

function signalLoaded(element: Element) {
    const container = element.closest("[data-imgit-container]");
    if (!container) return;
    (<HTMLElement>container).dataset.imgitLoaded = "";
}

function isElement(obj: Node | EventTarget): obj is Element {
    return "tagName" in obj;
}

function isVideo(element: Element): element is HTMLVideoElement {
    return element.tagName === "VIDEO";
}

function isImage(element: Element): element is HTMLImageElement {
    return element.tagName === "IMG";
}
