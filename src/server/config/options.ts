import { Plugin } from "./plugin.js";

/** Configures server behaviour. */
export type Options = {
    /** Local directory under which project's static files are stored. Required to resolve
     *  file paths of relative content sources; <code>./public</code> by default. */
    root: string;
    /** Regular expressions to use for capturing transformed assets syntax.
     *  Expects <code><url></code>, <code><alt></code> and <code><spec></code> capture groups
     *  (alt and spec are optional). By default, captures Markdown image syntax with spec defined as
     *  query params after alt: <code>!\[(?<alt>.*?)(?<spec>\?\S+?)?]\((?<url>\S+?)\)</code> */
    regex: RegExp[];
    /** Image source to show while content is loading. When per-asset cover generation is enabled
     *  in encode options, will use specified source as a fallback for legacy browsers (lacking avif support),
     *  otherwise will use the source for all covers; assign <code>null</code> to disable covers completely. */
    cover?: string | null;
    /** Default width threshold for the transformed assets, in pixels. When source asset is larger,
     *  will downscale it while preserving the original aspect. In case the source is 2x or larger,
     *  will as well generate additional "dense" variant that will be shown on high-dpi displays.
     *  This option is ignored when asset has width explicitly assigned via spec syntax. */
    width: number | null;
    /** Configure build artifacts caching; assign <code>null</code> to disable caching. */
    cache: CacheOptions | null;
    /** Configure remote content fetching. */
    fetch: FetchOptions;
    /** Configure content encoding. */
    encode: EncodeOptions;
    /** External imgit extensions; use to override or extend server behaviour. */
    plugins: Plugin[];
};

/** Configures server cache. */
export type CacheOptions = {
    /** Local directory where the build cache files are stored. When building static apps (SPA) on CI,
     *  consider checking-in the cache directory to boost remote build processes;
     *  <code>./public/imgit</code> by default. */
    root: string;
}

/** Configures remote assets downloading behaviour. */
export type FetchOptions = {
    /** Local directory to store downloaded remote content files;
     *  <code>./public/imgit/fetched</code> by default. */
    root: string;
    /** How long to wait when downloading remote asset, in seconds; 30 by default. */
    timeout: number;
    /** How many times to restart the download when request fails; 3 by default. */
    retries: number;
    /** How long to wait before restarting a failed download, in seconds; 6 by default.*/
    delay: number;
};

/** Configures assets encoding. */
export type EncodeOptions = {
    /** Local directory to store encoded content and generated files, such as covers;
     *  <code>./public/imgit/encoded</code> by default. */
    root: string;
    /** Configure main encoded file generation, ie file to replace source content in the built HTML. */
    main: {
        /** Tag to append to the names of generated main files; <code>@main</code> by default. */
        suffix: string;
        /** Encode parameters mapped by source content MIME type; matched in order. */
        specs: EncodeSpecMap;
    },
    /** Configure cover generation. By default, a tiny blurred webp cover is generated from source
     *  content and embedded as base64-encoded data for image HTML, which is shown while the source
     *  content is lazy-loading; specify <code>null</code> to disable cover generation. */
    cover: {
        /** Tag to append to the names of generated cover files; <code>@cover</code> by default. */
        suffix: string;
        /** Encode parameters mapped by source content MIME type; matched in order. */
        specs: EncodeSpecMap;
    } | null;
    /** Configure safe files generation, that is fallbacks used in case source content is not considered
     *  compatible with legacy or any browsers, such as AVIF or PSD; specify <code>null</code> to disable. */
    safe: {
        /** Tag to append to the names of generated safe files; <code>@safe</code> by default. */
        suffix: string;
        /** MIME content types considered safe or compatible with most browsers. When source asset content is
         *  not of the specified type, will create a fallback content with a compatible type; otherwise will
         *  use source content for fallback. */
        types: (string | Readonly<RegExp>)[];
        /** Encode parameters mapped by source content MIME type; matched in order. */
        specs: EncodeSpecMap;
    } | null;
    /** Configure dense files generation, that is variants with x the resolution of the main content
     *  shown on high-dpi displays. Dense variants are generated when either global or per-asset spec
     *  "width" option is specified with value less than the source content width by x or more;
     *  x is configured via 'factor' parameter; assign <code>null</code> to disable dense generation. */
    dense: {
        /** Tag to append to the names of generated dense files; <code>@dense</code> by default. */
        suffix: string;
        /** When width of the source content is larger by the specified factor compared to the
         *  scaled-down main content (due to per-asset or global width threshold, if any),
         *  dense variant will be generated; 2 by default. */
        factor: number;
        /** Encode parameters mapped by source content MIME type; matched in order. */
        specs: EncodeSpecMap;
    } | null;
};

/** Configures transformation to use when encoding. */
export type EncodeSpec = {
    /** Media container to use in format of out file extension, w/o dot; eg, <code>mp4</code>. */
    ext: string;
    /** Video codec to use; detects automatically based on container when not specified. */
    codec?: string;
    /** Select frame with specified index (0-based) instead of encoding full stream. */
    select?: number;
    /** Scale to the specified ratio preserving the aspect. */
    scale?: number;
    /** Apply blur with intensity in 0.0 to 1.0 range. */
    blur?: number;
};

/** Encode parameters mapped by source content MIME type or regex of the type. */
export type EncodeSpecMap = [string | Readonly<RegExp>, Readonly<EncodeSpec>][];
