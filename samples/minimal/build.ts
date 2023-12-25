import { boot, transform, exit } from "npm:imgit/server";
import youtube from "npm:imgit/youtube";
import svg from "npm:imgit/svg";

// Configure imgit server. In this case we're setting width threshold
// to 800px, so that when content is larger it'll be scaled down,
// while high-res original will still be shown on high-dpi displays.
// We also install YouTube and SVG plugins to imgit (optional).
await boot({ width: 800, plugins: [youtube(), svg()] });

// Read sample HTML document with remote images and video referenced
// via markdown image tags: ![](url). The format can be changed
// in boot config, for example to capture custom JSX tags instead.
const content = await Deno.readTextFile("./index.html");

// Run the imgit transformations over sample HTML content.
// This will capture images and video syntax, fetch the remote files,
// encode them to AV1/AVIF, generate covers, dense and safe variants when
// necessary, serve generated files (in this minimal case we just write them
// to 'public' directory; usually you'd upload to a CDN) and return transformed
// content where captured syntax is replaced with <picture> and <video> HTML
// tags referencing generated files.
const html = await transform(content);

// Write the transformed HTML under 'public' directory.
await Deno.writeTextFile("./public/index.html", html);

// Shutdown imgit server. Will cache the results of the transform operations,
// such as probing results, encoding profiles, generated covers and parameters
// of the source files. On consequent runs the server will skip most operations
// in case the cache is valid and source file is not modified. Cache files are
// written under 'public/imgit' directory (can be changed in boot config).
await exit();
