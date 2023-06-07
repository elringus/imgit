import * as path from "node:path";
import * as crypto from "node:crypto";
import MagicString, { SourceMap } from "magic-string";
import { Downloader } from "./download";
import { MediaResolver } from "./media";

/** Handles embedding remote media assets. */
export interface Embedder {
    /**
     * Finds remote URLs of media assets in the specified document,
     * downloads associated files and rewrites the URLs to point to the downloaded local files.
     * @param path Local path of the document for which to embed the assets (eg, `docs/guide/getting-started.md`).
     * @param document Content of the document (eg, HTML or markdown).
     * @returns Undefined when no remote URLs were found and nothing has changed or
     * changed document and associated source map.
     */
    embed(path: string, document: string): Promise<{ document: string, map: SourceMap } | undefined>;
}

export type EmbedOptions = {
    /**
     * The regex to match remote asset URLs.
     * @default Looks for http/s urls ending with png, jpg, jpeg, svg, gif or mp4.
     */
    urlRegex?: RegExp;
    /**
     * Directory path (relative to the project root) to store downloaded assets.
     * @default "./node_modules/.remote-assets"
     */
    assetsDir?: string;
    /**
     * Whether to append `?width=number&height=number` to the rewritten asset URLs.
     * @remarks Useful for injecting media size in HTML to optimize cumulative layout shift (CLS).
     * @default true
     */
    resolveMediaSize?: boolean;
}

export const defaultEmbedOptions = {
    urlRegex: /\b(https?:\/\/[\w_#&?.\/-]*?\.(?:png|jpe?g|svg|gif|mp4))(?=[`'")\]])/ig,
    assetsDir: "./node_modules/.remote-assets",
    resolveMediaSize: true
};

export class DefaultEmbedder implements Embedder {
    private readonly downloader: Downloader;
    private readonly resolver: MediaResolver;
    private readonly pattern: RegExp;
    private readonly assetsDir: string;
    private readonly appendSize: boolean;

    constructor(downloader: Downloader, resolver: MediaResolver, options?: EmbedOptions) {
        this.downloader = downloader;
        this.resolver = resolver;
        this.pattern = options?.urlRegex ?? defaultEmbedOptions.urlRegex;
        this.assetsDir = path.resolve(options?.assetsDir ?? defaultEmbedOptions.assetsDir);
        this.appendSize = options?.resolveMediaSize ?? defaultEmbedOptions.resolveMediaSize;
    }

    public async embed(path: string, document: string) {
        const regex = new RegExp(this.pattern, this.pattern.flags);
        const magic = new MagicString(document);
        for (let match; (match = regex.exec(document));)
            await this.handleMatch(match, magic, path);
        return !magic.hasChanged() ? undefined : {
            document: magic.toString(),
            map: magic.generateMap({ hires: true })
        };
    }

    private async handleMatch(match: RegExpExecArray, magic: MagicString, id: string) {
        const start = match.index;
        const end = start + match[0].length;
        const url = match[0] as string;
        if (isValidRemoteUrl(url))
            magic.overwrite(start, end, await this.resolve(id, url));
    }

    private async resolve(id: string, url: string) {
        const fileName = md5(url) + path.extname(url);
        const filePath = path.resolve(this.assetsDir, fileName);
        await this.downloader.download(url, filePath);
        let newUrl = path.relative(path.dirname(id), `${this.assetsDir}/${fileName}`);
        if (!newUrl.startsWith("./")) newUrl = "./" + newUrl;
        return this.appendSize ? appendMediaSize(newUrl, await this.resolver.resolve(filePath)) : newUrl;
    }
}

function isValidRemoteUrl(str: string) {
    let url;
    try { url = new URL(str); }
    catch (_) { return false; }
    return url.protocol === "http:" || url.protocol === "https:";
}

function md5(url: string) {
    return crypto.createHash("md5").update(url).digest("hex");
}

function appendMediaSize(url: string, sizes: { width: number, height: number }) {
    return `${url}?width=${sizes.width}&height=${sizes.height}`;
}
