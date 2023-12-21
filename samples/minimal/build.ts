import { boot, transform, exit } from "npm:imgit/server";

// Configure and initialize imgit server to load cached results
// from previous runs. In this case we're setting width threshold
// to 800px, so that when content is larger it'll be scaled down,
// while high-res original will still be shown on high-dpi displays.
await boot({ width: 800 });


const content = await Deno.readTextFile("./index.html");
const html = await transform(content);
await Deno.writeTextFile("./public/index.html", html);
await exit();
