# Vite Sample

Example on plugging imgit to [VitePress](https://vitepress.dev) SSG:

1. Install npm dependencies: `npm install`
2. Make sure [ffmpeg](https://www.ffmpeg.org) in installed in system path
3. Run `npm run build` to build the solution
4. Run `npm run preview` to preview the build

> [!IMPORTANT]
> Initial build could take up to 5 minutes for all the sample assets referenced in index.md to fetch and encode. The files will be stored under `public` directory and consequent runs won't incur additional processing time.

Examine `index.md` and `.vitepress/config.mts` sources for details.
