# stages

> **`const`** **stages**: `Object`

Individual document transformation stages.

## Type declaration

### build

> **build**: `Object`

### build.CONTAINER\_ATTR

> **build.CONTAINER\_ATTR**: `string`

### build.asset

> **build.asset**: (`asset`, `merges`?) => `Promise`\<`void`\> = `build`

Default HTML builder for supported asset types (images and video).

#### Parameters

• **asset**: [`BuiltAsset`](../type-aliases/BuiltAsset.md)

• **merges?**: [`BuiltAsset`](../type-aliases/BuiltAsset.md)[]

#### Returns

`Promise`\<`void`\>

### build.source

> **build.source**: (`path`) => `string` = `buildContentSource`

Builds serve url for content file with specified full path based on configured root option.

#### Parameters

• **path**: `string`

#### Returns

`string`

### capture

> **capture**: `Object`

### capture.assets

> **capture.assets**: (`content`, `assets`) => `void` = `capture`

Uses regexp defined in options to capture the assets syntax.

#### Parameters

• **content**: `string`

• **assets**: [`CapturedAsset`](../type-aliases/CapturedAsset.md)[]

#### Returns

`void`

### encode

> **encode**: `Object`

### encode.asset

> **encode.asset**: (`asset`) => `Promise`\<`void`\> = `encodeAsset`

Encodes asset content with ffmpeg.

#### Parameters

• **asset**: [`EncodedAsset`](../type-aliases/EncodedAsset.md)

#### Returns

`Promise`\<`void`\>

### fetch

> **fetch**: `Object`

### fetch.asset

> **fetch.asset**: (`asset`) => `Promise`\<`void`\> = `fetch`

Fetches asset's source content.

#### Parameters

• **asset**: [`FetchedAsset`](../type-aliases/FetchedAsset.md)

#### Returns

`Promise`\<`void`\>

### probe

> **probe**: `Object`

### probe.asset

> **probe.asset**: (`asset`) => `Promise`\<`void`\> = `probe`

Probes asset content with ffprobe.

#### Parameters

• **asset**: [`ProbedAsset`](../type-aliases/ProbedAsset.md)

#### Returns

`Promise`\<`void`\>

### resolve

> **resolve**: `Object`

### resolve.asset

> **resolve.asset**: (`asset`) => `void` = `resolve`

Resolves asset types supported by default.

#### Parameters

• **asset**: [`ResolvedAsset`](../type-aliases/ResolvedAsset.md)

#### Returns

`void`

### resolve.spec

> **resolve.spec**: (`query`) => [`AssetSpec`](../type-aliases/AssetSpec.md) = `resolveSpec`

Resolves spec formatted as URL query parameters.

#### Parameters

• **query**: `string`

#### Returns

[`AssetSpec`](../type-aliases/AssetSpec.md)

### rewrite

> **rewrite**: `Object`

### rewrite.content

> **rewrite.content**: (`content`, `assets`) => `string` = `rewrite`

Default rewrite procedure.

#### Parameters

• **content**: `string`

• **assets**: [`BuiltAsset`](../type-aliases/BuiltAsset.md)[]

#### Returns

`string`

## Source

[server/transform/index.ts:10](https://github.com/Elringus/Imgit/blob/f5cda02/src/server/transform/index.ts#L10)
