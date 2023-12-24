# Vite Sample

Example on plugging imgit to [vite](https://vitejs.dev) bundler:

1. Install npm dependencies: `npm install`
2. Make sure [ffmpeg](https://www.ffmpeg.org) in installed in system path
3. Run `npm run dev` to start vite's dev server with hot-reload
4. Run `npm run build` to bundle for production with vite
5. Run `npm run preview` to preview production build

> [!IMPORTANT]
> Initial run of dev and build commands could take up to 5 minutes for all the sample assets referenced in index.html to fetch and encode. The files will be stored under `public` directory and consequent runs won't incur additional processing time.

Examine `index.html` and `vite.config.ts` sources for details.
