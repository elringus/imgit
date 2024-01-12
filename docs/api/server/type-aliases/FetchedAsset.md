# FetchedAsset

```ts
type FetchedAsset: ResolvedAsset & Object;
```

Asset with all the applicable source content files available on the local file system.

## Type declaration

### content

```ts
content: FetchedContent;
```

Source content of the asset.

### dirty?

```ts
dirty?: boolean;
```

Whether any of the source content files were modified since last build.

## Source

[server/asset.ts:61](https://github.com/Elringus/Imgit/blob/fc320a2/src/server/asset.ts#L61)
