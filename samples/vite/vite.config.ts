import { defineConfig } from "vite";

// Importing imgit plugin for vite, as well as imgit plugins
// for YouTube and SVG. In order for relative imports to work
// set 'moduleResolution' to 'bundler' in tsconfig.json.
import imgit from "imgit/vite";
import youtube from "imgit/youtube";
import svg from "imgit/svg";

export default defineConfig({
    // Inject and configure imgit server. In this case we set width threshold
    // to 800px, so that when content is larger it'll be scaled down,
    // while high-res original will still be shown on high-dpi displays.
    // We also install YouTube and SVG plugins to imgit.
    plugins: [imgit({ width: 800, plugins: [youtube(), svg()] })]
});
