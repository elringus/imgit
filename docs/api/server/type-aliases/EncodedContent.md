# EncodedContent

> **EncodedContent**: [`ProbedContent`](ProbedContent.md) & `Object`

Optimized source of an asset with optional generated content.

## Type declaration

### cover?

> **cover**?: `string`

Generated variant of the source content to cover loading process, when applicable.

### dense?

> **dense**?: `string`

Generated variant of the source content for high-dpi displays, when applicable.

### encoded

> **encoded**: `string`

Full path to the asset's encoded/optimized content file on local file system.

### safe?

> **safe**?: `string`

Generated variant of the source content for compatibility/fallback, when applicable.

## Source

[server/asset.ts:105](https://github.com/Elringus/Imgit/blob/cf06d86/src/server/asset.ts#L105)
