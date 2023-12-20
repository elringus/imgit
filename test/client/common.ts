import { Mock, vi } from "vitest";

// Mock browser API subset used by the tested client code.
export type Global = {
    window: {
        navigator: { userAgent: string };
        open: Mock<[string, string]>;
        MutationObserver?: {};
        IntersectionObserver?: {};
    };
    document: { body: Element } | undefined;
    MutationObserver: typeof MutationObserverMock;
    IntersectionObserver: typeof IntersectionObserverMock;
};

// https://developer.mozilla.org/docs/Web/API/DOMTokenList
export class TokenList {
    add: Mock<[string]> = vi.fn();
}

// https://developer.mozilla.org/docs/Web/API/Node
export class Node {}

// https://developer.mozilla.org/docs/Web/API/HTMLElement
export class Element extends Node {
    public children: Element[] = [];
    public classList = new TokenList();
    public dataset: { [name: string]: string } = {};
    public parentElement?: Element;
    public firstChild?: Element;
    public lastChild?: Element;
    public hidden?: boolean;
    constructor(public tagName: string) { super(); }
    addEventListener: Mock<[string, (evt: Event) => void]> = vi.fn();
    removeEventListener: Mock<[string, (evt: Event) => void]> = vi.fn();
    querySelectorAll: Mock<[string], Element[]> = vi.fn(_ => []);
    closest: Mock<[string], Element> = vi.fn();
}

// https://developer.mozilla.org/docs/Web/API/HTMLVideoElement
export class ImageElement extends Element {
    public complete: boolean = false;
    public naturalHeight: number = 0;
    constructor() { super("IMG"); }
}

// https://developer.mozilla.org/docs/Web/API/HTMLVideoElement
export class VideoElement extends Element {
    public readyState: number = 0;
    constructor() { super("VIDEO"); }
    load = vi.fn();
}

// https://developer.mozilla.org/docs/Web/API/HTMLSourceElement
export class SourceElement extends Element {
    public src = "";
    public type = "";
    constructor() { super("SOURCE"); }
}

// https://developer.mozilla.org/docs/Web/API/MutationObserver
export class MutationObserverMock {
    constructor(handle: (_: MutationRecord[], __: MutationObserverMock) => void) {
        ctx.mutation.observer = this;
        ctx.mutation.mutate = records => handle(records, this);
    }
    observe = vi.fn();
}

// https://developer.mozilla.org/docs/Web/API/MutationRecord
export type MutationRecord = {
    readonly addedNodes: Node[];
    readonly removedNodes: Node[];
}

// https://developer.mozilla.org/docs/Web/API/IntersectionObserver
export class IntersectionObserverMock {
    constructor(handle: (_: IntersectionObserverEntry[], __: IntersectionObserverMock) => void) {
        ctx.intersection.observer = this;
        ctx.intersection.intersect = entries => handle(entries, this);
    }
    observe = vi.fn();
    unobserve = vi.fn();
}

// https://developer.mozilla.org/docs/Web/API/IntersectionObserverEntry
export type IntersectionObserverEntry = {
    readonly isIntersecting: boolean;
    readonly target: Element;
}

// https://developer.mozilla.org/docs/Web/API/Event
export type Event = {
    currentTarget?: Node;
}

export const ctx: {
    mutation: {
        observer?: MutationObserverMock,
        mutate?: (entries: MutationRecord[]) => void
    },
    intersection: {
        observer?: IntersectionObserverMock,
        intersect?: (entries: IntersectionObserverEntry[]) => void
    }
} = { mutation: {}, intersection: {} };

export function setup(global: Global): void {
    global.window = {
        navigator: { userAgent: "" },
        open: vi.fn(),
        MutationObserver: MutationObserverMock,
        IntersectionObserver: IntersectionObserverMock
    };
    global.document = { body: new Element("BODY") };
    global.MutationObserver = vi.fn(handle => new MutationObserverMock(handle));
    global.IntersectionObserver = vi.fn(handle => new IntersectionObserverMock(handle));
}
