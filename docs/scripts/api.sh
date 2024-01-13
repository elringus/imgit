# https://typedoc-plugin-markdown.org/themes/vitepress/quick-start

echo '{
    "entryPoints": [
        "../src/server/index.ts",
        "../src/client/index.ts",
        "../src/plugin/youtube/index.ts",
        "../src/plugin/svg.ts",
        "../src/plugin/astro.ts",
        "../src/plugin/vite.ts"
    ],
    "tsconfig": "../src/tsconfig.json",
    "out": "api",
    "readme": "none",
    "githubPages": false,
    "useCodeBlocks": true,
    "hideGenerator": true,
    "hideBreadcrumbs": true,
    "textContentMappings": {
        "title.indexPage": "API Reference",
        "title.memberPage": "{name}",
    },
    "plugin": ["typedoc-plugin-markdown", "typedoc-vitepress-theme"]
}' > typedoc.json

typedoc
sed -i -z "s/API Reference/API Reference\nAuto-generated with [typedoc-plugin-markdown](https:\/\/typedoc-plugin-markdown.org)./" api/index.md
rm typedoc.json
