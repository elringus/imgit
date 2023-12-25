# Minimal Sample

Example on using imgit directly, without plugging into bundlers:

1. Make sure [ffmpeg](https://www.ffmpeg.org) in installed in system path
2. Run `build.ts` with [deno](https://deno.com): `deno run -A build.ts`
3. Serve `public` directory with an HTTP server, eg: `npx serve public`

> [!IMPORTANT]
> Initial build could take up to 5 minutes for all the sample assets referenced in index.html to fetch and encode. The files will be stored under `public` directory and consequent runs won't incur additional processing time.

Examine `index.html` and `build.ts` sources for details.
