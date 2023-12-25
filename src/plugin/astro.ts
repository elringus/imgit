import { Prefs, Platform, Plugin, std } from "../server/index.js";
import { bind } from "../server/platform/index.js";
import vite from "../plugin/vite.js";

// https://docs.astro.build/en/reference/integrations-reference
declare type AstroIntegration = {
    name: string;
    hooks: {
        "astro:config:setup"?: (options: {
            injectScript: AstroInjector;
            updateConfig: (config: { vite: { plugins: unknown[] } }) => void;
        }) => void;
    };
};

// https://docs.astro.build/en/reference/integrations-reference/#injectscript-option
declare type AstroInjector = (stage: "page", content: string) => void;

/** Creates imgit integration instance for astro.
 *  @param prefs Plugin preferences; will use pre-defined defaults when not assigned.
 *  @param platform Runtime APIs to use; will attempt to detect automatically when not assigned. */
export default function (prefs?: Prefs, platform?: Platform): AstroIntegration {
    return {
        name: "imgit",
        hooks: {
            "astro:config:setup": async ({ injectScript, updateConfig }) => {
                await bind(platform); // inject is invoked before vite plugin is started
                injectClient(injectScript, <never>prefs?.plugins);
                updateConfig({ vite: { plugins: [vite({ ...prefs, inject: false }, platform)] } });
            }
        }
    };
}

function injectClient(injector: AstroInjector, plugins?: Plugin[]): void {
    const dir = std.path.dirname(std.path.fileUrlToPath(import.meta.url));
    inject(std.path.resolve(`${dir}/../client/styles.css`), injector);
    inject(std.path.resolve(`${dir}/../client/index.js`), injector);
    if (plugins) for (const plugin of plugins) if (plugin.inject)
        for (const injections of plugin.inject())
            inject(injections.src, injector);
}

function inject(src: string, injector: AstroInjector): void {
    injector("page", `import("/@fs/${src}");`);
}
