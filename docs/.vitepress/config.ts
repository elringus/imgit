import { defineConfig } from "vitepress";
import imgit from "imgit/vite";
import svg from "imgit/svg";
import youtube from "imgit/youtube";

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "imgit",
    titleTemplate: ":title • imgit",
    cleanUrls: true,
    lastUpdated: true,
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
        externalLinkIcon: true,
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
                text: "v0.1.0", items: [
                    { text: "Changelog", link: "https://github.com/elringus/imgit/releases/tag/v0.1.0" }
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
    sitemap: { hostname: "https://imgit.dev" },
    vite: { plugins: [imgit({ width: 688, plugins: [svg(), youtube()] })] }
});
