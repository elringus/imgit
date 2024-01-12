# EncodedContent

```ts
type EncodedContent: ProbedContent & Object;
```

Optimized source of an asset with optional generated content.

## Type declaration

### cover?

```ts
cover?: string;
```

Generated variant of the source content to cover loading process, when applicable.

### dense?

```ts
dense?: string;
```

Generated variant of the source content for high-dpi displays, when applicable.

### encoded

```ts
encoded: string;
```

Full path to the asset's encoded/optimized content file on local file system.

### safe?

```ts
safe?: string;
```

Generated variant of the source content for compatibility/fallback, when applicable.

## Source

[server/asset.ts:105](https://github.com/Elringus/Imgit/blob/157689c/src/server/asset.ts#L105)
