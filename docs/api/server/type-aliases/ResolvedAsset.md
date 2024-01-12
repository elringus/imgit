# ResolvedAsset

```ts
type ResolvedAsset: CapturedAsset & Object;
```

Asset with resolved source content locations and specs.

## Type declaration

### content

```ts
content: ResolvedContent;
```

Source content of the asset.

### spec

```ts
spec: AssetSpec;
```

Optional user-defined asset specifications resolved (parsed) from captured syntax.

## Source

[server/asset.ts:23](https://github.com/Elringus/Imgit/blob/fc320a2/src/server/asset.ts#L23)
