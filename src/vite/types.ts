import { SourceMap } from "magic-string";

export type VitePlugin = {
    name: string;
    enforce: string;
    configResolved: (resolved: ViteConfig) => Promise<void>;
    transform: (code: string, id: string) => Promise<{ code: string, map: SourceMap | null } | null>;
    transformIndexHtml: (html: string, cts: { filename: string }) => Promise<string | null>;
}

export type ViteConfig = {
    build: { sourcemap: boolean };
    server: { force: boolean };
}
