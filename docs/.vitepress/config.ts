import { defineConfig } from "vitepress";
import md from "./md";
import escapeCode from "./escape-code";
import imgit from "imgit/vite";
import svg from "imgit/svg";
import youtube from "imgit/youtube";

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "imgit",
    titleTemplate: ":title • imgit",
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
        search: { provider: "local" },
        lastUpdated: { text: "Updated", formatOptions: { dateStyle: "medium" } },
        sidebarMenuLabel: "Menu",
        darkModeSwitchLabel: "Appearance",
        returnToTopLabel: "Return to top",
        outline: { label: "On this page", level: "deep" },
        docFooter: { prev: "Previous page", next: "Next page" },
        nav: [
            { text: "Guide", link: "/guide/introduction", activeMatch: "/guide/" },
            { text: "Reference", link: "/api/" },
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
                        { text: "Introduction", link: "/guide/introduction" },
                        { text: "Getting Started", link: "/guide/getting-started" },
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
            ]
        }
    },
    sitemap: { hostname: "https://imgit.dev" }
});
