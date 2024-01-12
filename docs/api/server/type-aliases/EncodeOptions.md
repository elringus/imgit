# EncodeOptions

```ts
type EncodeOptions: Object;
```

Configures assets encoding.

## Type declaration

### cover

```ts
cover: Object | null;
```

Configure cover generation. By default, a tiny blurred webp cover is generated from source
 content and embedded as base64-encoded data for image HTML, which is shown while the source
 content is lazy-loading; specify `null` to disable cover generation.

### dense

```ts
dense: Object | null;
```

Configure dense files generation, that is variants with x the resolution of the main content
 shown on high-dpi displays. Dense variants are generated when either global or per-asset spec
 "width" option is specified with value less than the source content width by x or more;
 x is configured via 'factor' parameter; assign `null` to disable dense generation.

### main

```ts
main: Object;
```

Configure main encoded file generation, ie file to replace source content in the built HTML.

### main.specs

```ts
main.specs: EncodeSpecMap;
```

Encode parameters mapped by source content MIME type; matched in order.

### main.suffix

```ts
main.suffix: string;
```

Tag to append to the names of generated main files; `@main` by default.

### root

```ts
root: string;
```

Local directory to store encoded content and generated files, such as covers;
 `./public/imgit/encoded` by default.

### safe

```ts
safe: Object | null;
```

Configure safe files generation, that is fallbacks used in case source content is not considered
 compatible with legacy or any browsers, such as AVIF or PSD; specify `null` to disable.

## Source

[server/config/options.ts:56](https://github.com/Elringus/Imgit/blob/fc320a2/src/server/config/options.ts#L56)
