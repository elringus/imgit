import { mutation } from "../../client/index.js";

mutation.addHandler([handleAdded, handleRemoved]);
typeof document === "object" && handleAdded(document.body);

function handleAdded(added: Element) {
    for (const banner of added.querySelectorAll<HTMLButtonElement>("button.imgit-bili-banner"))
        banner.addEventListener("click", handleBannerClick);
    for (const poster of added.querySelectorAll<HTMLDivElement>("div.imgit-bili-poster"))
        poster.addEventListener("click", handlePlayClick);
}

function handleRemoved(removed: Element) {
    for (const banner of removed.querySelectorAll<HTMLButtonElement>("button.imgit-bili-banner"))
        banner.removeEventListener("click", handleBannerClick);
    for (const poster of removed.querySelectorAll<HTMLDivElement>("div.imgit-bili-poster"))
        poster.removeEventListener("click", handlePlayClick);
}

function handleBannerClick(event: Event) {
    const button = <HTMLButtonElement>event.currentTarget;
    const href = button.dataset.href!;
    window.open(href, "_blank");
}

function handlePlayClick(event: Event) {
    const poster = <HTMLDivElement>event.currentTarget;
    const container = <HTMLDivElement>poster.parentElement;
    const iframe = <HTMLIFrameElement>container.lastChild!.firstChild;
    container.classList.add("imgit-bili-loading");
    iframe.src = iframe.dataset.src!;
    iframe.addEventListener("load", handlePlayerLoaded);
}

function handlePlayerLoaded(event: Event) {
    const iframe = <HTMLIFrameElement>event.currentTarget;
    const player = <HTMLDivElement>iframe.parentElement;
    const container = <HTMLDivElement>player.parentElement;
    container.classList.add("imgit-bili-playing");
    player.hidden = false;
}
