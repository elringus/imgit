import { boot, transform, exit } from "npm:imgit/server";
import serve from "npm:serve-handler";
import http from "node:http";

// Configure imgit server. In this case we're setting width threshold
// to 800px, so that when content is larger it'll be scaled down,
// while high-res original will still be shown on high-dpi displays.
// Will as well load cached results from previous runs on boot.
await boot({ width: 800 });

// Read sample HTML file with remote images and video referenced
// via markdown image tags: ![](url). The format can be changed
// in boot config, for example to capture custom JSX tags instead.
const content = await Deno.readTextFile("./index.html");

// Run the imgit transformations over sample HTML.
// This will capture referenced content syntax, fetch the remote files,
// encode them to AV1/AVIF, generate covers, dense and safe variants
// when necessary, serve generated files to a CDN (in this minimal case
// the files will be copied to 'public' directory instead) and return
// transformed content where captured content syntax is replaced with
// <picture> and <video> HTML tags referencing generated files.
const html = await transform(content);

// Write the transformed HTML under 'public' directory.
await Deno.writeTextFile("./public/index.html", html);

// Shutdown imgit server. Will cache the results of the transform operations,
// such as probing results, encoding profiles, generated covers and parameters
// of the source files. On consequent runs the server will skip most operations
// in case the cache is valid and source file is not modified. Cache files are
// written under 'public/imgit' directory (can be changed in boot config).
await exit();

// Serve generated files with a local HTTP server.
http.createServer((req, res) => serve(req, res, { public: "public" }))
    .listen(3000, () => console.log("Serving at http://localhost:3000"));
