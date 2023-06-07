import { MarkdownEnv } from "./types";
import { Replace } from "./replace";
import { getMediaSize } from "../embed";

export function RenderImages(regex?: RegExp) {
    return Replace(regex ?? /!\[(.*?)]\((\S+?\.(?:png|jpe?g|svg|gif))\)/m, buildImageTags);
}

export function RenderVideo(regex?: RegExp) {
    return Replace(regex ?? /!\[(.*?)]\((\S+?\.mp4)\)/m, buildVideoTags);
}

function buildImageTags(match: string[], _: MarkdownEnv) {
    const size = getMediaSize(match[2]);
    return `<img src="${match[2]}" alt="${match[1]}" width="${size.width}" height="${size.height}">`;
}

function buildVideoTags(match: string[], _: MarkdownEnv) {
    const size = getMediaSize(match[1]);
    const source = `<source src="${match[1]}" type="video/mp4">`;
    return `<video class="video" loop autoplay muted playsinline width="${size.width}" height="${size.height}">${source}</video>`;
}
