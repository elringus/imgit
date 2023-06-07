import { DefaultMediaResolver } from "./media";
import { DownloadOptions, DefaultDownloader } from "./download";
import { EmbedOptions, DefaultEmbedder } from "./embed";

export function createDefaultEmbedder(options?: EmbedOptions & DownloadOptions) {
    const downloader = new DefaultDownloader(options);
    const resolver = new DefaultMediaResolver();
    return new DefaultEmbedder(downloader, resolver, options);
}

export function getMediaSize(uri: string) {
    const start = uri.lastIndexOf("?");
    const url = new URL("https://domain.com" + uri.substring(start));
    return { width: url.searchParams.get("width")!, height: url.searchParams.get("height")! };
}
