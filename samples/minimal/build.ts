import { boot, transform, exit } from "npm:imgit/server";

await boot({ width: 720 });
const content = await Deno.readTextFile("./index.html");
const html = await transform(content);
await Deno.writeTextFile("./public/index.html", html);
await exit();
