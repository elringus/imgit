# Minimal Sample

Example on using imgit directly, without plugging into bundlers:

1. Make sure [ffmpeg](https://www.ffmpeg.org) in installed in system path
2. Run `build.ts` with [deno](https://deno.com): `deno run -A build.ts`
3. Wait for the encoding operations to complete, which may take a while
4. Open local HTTP server url printed in the console (http://localhost:3000)

Examine `index.html` and `build.ts` sources for details.
