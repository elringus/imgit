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
        logoLink: "https://imgit.dev",
        socialLinks: [{ icon: "github", link: "https://github.com/elringus/imgit" }],
        search: { provider: "local" },
        lastUpdated: { text: "Updated", formatOptions: { dateStyle: "medium" } },
        sidebarMenuLabel: "Menu",
        darkModeSwitchLabel: "Appearance",
        returnToTopLabel: "Return to top",
        outline: { label: "On this page", level: "deep" },
        docFooter: { prev: "Previous page", next: "Next page" },
        nav: [
            { text: "Guide", link: "/guide/", activeMatch: "/guide/" },
            { text: "Reference", link: "/api/" },
            {
                text: `v${(await import("./../../package.json")).version}`, items: [
                    { text: "Changes", link: "https://github.com/elringus/imgit/releases/latest" },
                    { text: "Contribute", link: "https://github.com/elringus/imgit/labels/help%20wanted" },
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
                    collapsed: true,
                    items: [
                        { text: "Introduction", link: "/guide/" },
                        { text: "Getting Started", link: "/guide/getting-started" }
                    ]
                },
                {
                    text: "Integrations",
                    collapsed: true,
                    items: [
                        { text: "Vite", link: "/guide/vite" },
                        { text: "Astro", link: "/guide/astro" }
                    ]
                },
                {
                    text: "Plugins",
                    collapsed: true,
                    items: [
                        { text: "YouTube", link: "/guide/youtube" },
                        { text: "SVG", link: "/guide/svg" }
                    ]
                }
            ]
        }
    },
    sitemap: { hostname: "https://imgit.dev" }
});
