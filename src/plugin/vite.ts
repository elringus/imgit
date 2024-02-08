import { Platform, Prefs, Plugin, boot, exit, transform, std, loader } from "../server/index.js";

/** Configures vite plugin behaviour. */
export type VitePrefs = Prefs & {
    /** Specify condition when document shouldn't be transformed by the vite plugin. */
    skip?: (filename: string) => boolean;
    /** Whether to inject imgit client JavaScript module to index HTML; enabled by default. */
    inject?: boolean;
};

// https://vitejs.dev/guide/api-plugin
export type VitePlugin = {
    name: string;
    enforce: "pre" | "post";
    buildStart: (options: unknown) => Promise<void> | void;
    transform: (code: string, id: string, options?: { ssr?: boolean; }) => Promise<string> | string;
    transformIndexHtml: {
        order: "pre" | "post",
        handler: (html: string, ctx: { filename: string }) => Promise<{ html: string, tags: HtmlTag[] }>
    };
    buildEnd: (error?: Error) => Promise<void> | void;
    resolveId: (source: string) => string | null;
    load: (id: string) => Promise<string> | null;
};

// https://vitejs.dev/guide/api-plugin#transformindexhtml
export type HtmlTag = {
    tag: string;
    attrs?: Record<string, string | boolean>;
    children?: string | HtmlTag[];
    injectTo?: "head" | "body" | "head-prepend" | "body-prepend";
};

/** Creates imgit plugin instance for vite.
 *  @param prefs Plugin preferences; will use pre-defined defaults when not assigned.
 *  @param platform Runtime APIs to use; will attempt to detect automatically when not assigned. */
export default function (prefs?: VitePrefs, platform?: Platform): VitePlugin {
    return {
        name: "imgit",
        enforce: "pre",
        buildStart: () => boot(prefs, platform),
        transform: (code, id) => prefs?.skip?.(id) ? code : transform(code, id),
        transformIndexHtml: {
            order: "pre",
            handler: async (html, ctx) => ({
                html: prefs?.skip?.(ctx.filename) ? html : await transform(html, ctx.filename),
                tags: !prefs || prefs.inject !== false ? inject(<never>prefs?.plugins) : []
            })
        },
        buildEnd: exit,
        resolveId: (source) => loader.isImgitAssetImport(source) ? source : null,
        load: (id) => loader.isImgitAssetImport(id) ? loader.importImgitAsset(id) : null
    };
}

function inject(plugins?: Plugin[]): HtmlTag[] {
    const dir = std.path.dirname(std.path.fileUrlToPath(import.meta.url));
    const tags = [
        buildTag("css", std.path.resolve(`${dir}/../client/styles.css`)),
        buildTag("module", std.path.resolve(`${dir}/../client/index.js`))
    ];
    if (plugins) for (const plugin of plugins) if (plugin.inject)
        for (const injections of plugin.inject())
            tags.push(buildTag(injections.type, injections.src));
    return tags;
}

function buildTag(type: "css" | "module", src: string): HtmlTag {
    const path = `/@fs/${src}`;
    if (type === "css") return {
        tag: "link", injectTo: "head",
        attrs: { "rel": "stylesheet", "type": "text/css", "href": path }
    };
    return {
        tag: "script", injectTo: "body",
        attrs: { "type": "module" },
        children: `import("${path}");`
    };
}
