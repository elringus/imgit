import { defineConfig, DefaultTheme } from "vitepress";
import md from "./md";
import escapeCode from "./escape-code";
import imgit from "imgit/vite";
import svg from "imgit/svg";
import youtube from "imgit/youtube";

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "imgit",
    titleTemplate: ":title • imgit",
    description: "JavaScript utility to optimize web media content.",
    appearance: "dark",
    cleanUrls: true,
    lastUpdated: true,
    markdown: md,
    vite: { plugins: [imgit({ width: 688, plugins: [svg(), youtube(), escapeCode] })] },
    head: [
        ["link", { rel: "icon", href: "/favicon.svg" }],
        ["link", { rel: "preload", href: "/fonts/inter.woff2", as: "font", type: "font/woff2", crossorigin: "" }],
        ["link", { rel: "preload", href: "/fonts/jb.woff2", as: "font", type: "font/woff2", crossorigin: "" }],
        ["meta", { name: "theme-color", content: "#ee3248" }],
        ["meta", { name: "og:image", content: "/img/og.jpg" }],
        ["meta", { name: "twitter:card", content: "summary_large_image" }]
    ],
    themeConfig: {
        logo: { src: "/favicon.svg" },
        logoLink: "/",
        socialLinks: [{ icon: "github", link: "https://github.com/elringus/imgit" }],
        search: { provider: "local", options: { detailedView: true } },
        lastUpdated: { text: "Updated", formatOptions: { dateStyle: "medium" } },
        sidebarMenuLabel: "Menu",
        darkModeSwitchLabel: "Appearance",
        returnToTopLabel: "Return to top",
        outline: { label: "On this page", level: [2, 3] },
        docFooter: { prev: "Previous page", next: "Next page" },
        nav: [
            { text: "Guide", link: "/guide/", activeMatch: "/guide/" },
            { text: "Reference", link: "/api/", activeMatch: "/api/" },
            {
                text: `v${(await import("./../../package.json")).version}`, items: [
                    { text: "Changes", link: "https://github.com/elringus/imgit/releases/latest" },
                    { text: "Contribute", link: "https://github.com/elringus/imgit/labels/help%20wanted" }
                ]
            }
        ],
        editLink: {
            pattern: "https://github.com/elringus/imgit/edit/main/docs/:path",
            text: "Edit this page on GitHub"
        },
        sidebar: {
            "/guide/": [
                {
                    text: "Guide",
                    items: [
                        { text: "Introduction", link: "/guide/" },
                        { text: "Getting Started", link: "/guide/getting-started" },
                        { text: "Asset Import", link: "/guide/asset-import" },
                        { text: "GPU Acceleration", link: "/guide/gpu-acceleration" },
                        { text: "Plugins", link: "/guide/plugins" }
                    ]
                },
                {
                    text: "Integrations",
                    items: [
                        { text: "Vite", link: "/guide/integrations/vite" },
                        { text: "Astro", link: "/guide/integrations/astro" },
                        { text: "Nuxt", link: "/guide/integrations/nuxt" },
                        { text: "Remix", link: "/guide/integrations/remix" },
                        { text: "SolidStart", link: "/guide/integrations/solid" },
                        { text: "SvelteKit", link: "/guide/integrations/svelte" },
                        { text: "VitePress", link: "/guide/integrations/vitepress" }
                    ]
                }
            ],
            "/api/": await getApiSidebar()
        }
    },
    sitemap: { hostname: "https://imgit.dev" }
});

async function getApiSidebar(): Promise<DefaultTheme.SidebarItem[]> {
    const items = (await import("./../api/typedoc-sidebar.json")).default;
    const server = items.find(i => i.text === "server");
    const client = items.find(i => i.text === "client");
    const other = items.filter(i => i !== server && i !== client);
    return [{ text: "Reference", items: [server, client, ...other] }];
}
