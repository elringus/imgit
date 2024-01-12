# FetchedAsset

> **FetchedAsset**: [`ResolvedAsset`](ResolvedAsset.md) & `Object`

Asset with all the applicable source content files available on the local file system.

## Type declaration

### content

> **content**: [`FetchedContent`](FetchedContent.md)

Source content of the asset.

### dirty?

> **dirty**?: `boolean`

Whether any of the source content files were modified since last build.

## Source

[server/asset.ts:61](https://github.com/Elringus/Imgit/blob/cf06d86/src/server/asset.ts#L61)
