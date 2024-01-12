# https://typedoc-plugin-markdown.org/themes/vitepress/quick-start

echo '{
    "entryPoints": [
        "../src/server/index.ts",
        "../src/plugin/youtube/index.ts",
        "../src/plugin/svg.ts",
        "../src/plugin/astro.ts",
        "../src/plugin/vite.ts"
    ],
    "tsconfig": "../src/tsconfig.json",
    "entryFileName": "index.md",
    "hidePageHeader": true,
    "hideBreadcrumbs": true,
    "useCodeBlocks": false,
    "out": "api",
    "textContentMappings": {
        "title.indexPage": "API Reference",
        "title.memberPage": "{name}",
    },
    "plugin": ["typedoc-plugin-markdown", "typedoc-vitepress-theme"]
}' > typedoc.json

# typedoc-vitepress-theme yield empty output, so running twice (bug?)
typedoc --plugin typedoc-plugin-markdown
typedoc --cleanOutputDir false

sed -i -z "s/,\n\s*\"collapsed\": true\n/\n/g" api/typedoc-sidebar.json
find api/. -type f -exec sed -z -i "s/\n\*\*\*\n\nGenerated using .*//" {} \;

mv api/modules.md api/index.md
rm api/.nojekyll typedoc.json
