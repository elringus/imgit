# Getting Started

Make sure [ffmpeg](https://ffmpeg.org) version 6.0 or later is available in system path. You can either [build from source](https://trac.ffmpeg.org/wiki/CompilationGuide) or install from a package manager:

::: code-group

```sh [Linux]
apt install ffmpeg
```

```sh [Mac]
brew install ffmpeg
```

```sh [Windows]
choco install ffmpeg
```

:::

::: tip
It's possible to swap ffmpeg with an alternative solution (eg, remote encoding service) via probe and encode hooks, allowing to use imgit in constraint environments, such as edge runtimes.
:::

Install imgit as a dev dependency from NPM:

::: code-group

```sh [npm]
npm install -D imgit
```

```sh [yarn]
yarn add -D imgit
```

```sh [pnpm]
pnpm add -D imgit
```

```sh [bun]
bun add -D imgit
```

:::

When using any of the supported integrations continue on the dedicated page:

 - [Vite]()
 - [Astro]()
 - [Nuxt]()
 - [Remix]()
 - [SolidStart]()
 - [SvelteKit]()
 - [VitePress]()
