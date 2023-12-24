# Astro Sample

Example on plugging imgit to [astro](https://astro.build) web framework:

1. Install npm dependencies: `npm install`
2. Make sure [ffmpeg](https://www.ffmpeg.org) in installed in system path
3. Run `npm run dev` to start dev server with hot-reload
4. Run `npm run build` to bundle for production
5. Run `npm run preview` to preview production build

> [!IMPORTANT]
> Initial run of dev and build commands could take up to 5 minutes for all the sample assets referenced in index.astro to fetch and encode. The files will be stored under `public` directory and consequent runs won't incur additional processing time.

Examine `src/pages/index.astro` and `astro.config.mts` sources for details.
