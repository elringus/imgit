import { CapturedAsset, ResolvedAsset, FetchedAsset, ProbedAsset, EncodedAsset, BuiltAsset } from "../asset.js";

/** External imgit extension. */
export type Plugin = {
    /** Custom procedure to capture asset syntax. Given id (filename) and content (text) of transformed document
     *  populate provided assets array and return true or return false when can't handle the document,
     *  in which case it'll be handled by next procedures in the plugin chain. */
    capture?: (content: string, assets: CapturedAsset[], id?: string) => boolean | Promise<boolean>;
    /** Custom asset resolver. Given captured asset syntax, resolves asset type,
     *  content locations and specs (in-place). Return false when the resolver can't
     *  handle the asset, in which case it'll be handled by next resolvers in the plugin chain. */
    resolve?: (asset: ResolvedAsset) => boolean | Promise<boolean>;
    /** Custom asset downloader. Given resolved asset, fetches source content and assigns file's full path on
     *  local file system to the asset (in-place). Return false when the fetcher can't handle the asset,
     *  in which case it'll be handled by next fetchers in the plugin chain. */
    fetch?: (asset: FetchedAsset) => boolean | Promise<boolean>;
    /** Custom content info resolver. Given fetched asset, resolves and assigns media content
     *  information (in-place). Return false when the implementation can't or shouldn't handle the asset,
     *  in which case it'll be handled by next probe handlers in the plugin chain. */
    probe?: (asset: ProbedAsset) => boolean | Promise<boolean>;
    /** Custom content encoder. Given probed asset, encodes and assigns full file paths to the encoded content
     *  files (in-place). Return false when the implementation can't encode the asset,
     *  in which case it'll be handled by next encoders in the plugin chain. */
    encode?: (asset: EncodedAsset) => boolean | Promise<boolean>;
    /** Custom asset HTML builder. Given encoded asset(s), build HTML (in-place for all the input
     *  assets) to replace captured syntax in the transformed document. May include additional merged
     *  assets when associated syntax were joined via "merge" spec. Return false when the builder can't
     *  handle the assets, in which case they'll be handled by next builders in the plugin chain. */
    build?: (asset: BuiltAsset, merges?: BuiltAsset[]) => boolean | Promise<boolean>;
    /** Custom asset server. Given full path to a content file and associated asset info,
     *  return URL under which the file will be served and prepare the file to be served (eg, copy to
     *  the static assets dir or upload to a CDN). Return null when the server can't
     *  handle the asset, in which case it'll be handled by next servers in the plugin chain. */
    serve?: (path: string, asset: Readonly<BuiltAsset>) => null | Promise<string | null>;
    /** Custom procedure to rewrite captured assets syntax with built HTML. Given id (filename) and
     *  content (text) of transformed document return overwritten content or false when can't handle the case,
     *  in which case it'll be handled by next procedures in the plugin chain. */
    rewrite?: (content: string, assets: BuiltAsset[], id?: string) => (string | null) | Promise<string | null>;
    /** When specified, will inject specified client-side content when plugged to bundlers. */
    inject?: () => PluginInjection[];
};

/** Used to inject client-side content for a plugin. */
export type PluginInjection = {
    /** Whether injected content is a JS module or CSS stylesheet. */
    type: "module" | "css";
    /** Full path to the injected file on local file system. */
    src: string;
};
