# Plugin

> **Plugin**: `Object`

External imgit extension.

## Type declaration

### build?

> **build**?: (`asset`, `merges`?) => `boolean` \| `Promise`\<`boolean`\>

Custom asset HTML builder. Given encoded asset(s), build HTML (in-place for all the input
 assets) to replace captured syntax in the transformed document. May include additional merged
 assets when associated syntax were joined via "merge" spec. Return false when the builder can't
 handle the assets, in which case they'll be handled by next builders in the plugin chain.

#### Parameters

• **asset**: [`BuiltAsset`](BuiltAsset.md)

• **merges?**: [`BuiltAsset`](BuiltAsset.md)[]

#### Returns

`boolean` \| `Promise`\<`boolean`\>

### capture?

> **capture**?: (`content`, `assets`, `id`?) => `boolean` \| `Promise`\<`boolean`\>

Custom procedure to capture asset syntax. Given id (filename) and content (text) of transformed document
 populate provided assets array and return true or return false when can't handle the document,
 in which case it'll be handled by next procedures in the plugin chain.

#### Parameters

• **content**: `string`

• **assets**: [`CapturedAsset`](CapturedAsset.md)[]

• **id?**: `string`

#### Returns

`boolean` \| `Promise`\<`boolean`\>

### encode?

> **encode**?: (`asset`) => `boolean` \| `Promise`\<`boolean`\>

Custom content encoder. Given probed asset, encodes and assigns full file paths to the encoded content
 files (in-place). Return false when the implementation can't encode the asset,
 in which case it'll be handled by next encoders in the plugin chain.

#### Parameters

• **asset**: [`EncodedAsset`](EncodedAsset.md)

#### Returns

`boolean` \| `Promise`\<`boolean`\>

### fetch?

> **fetch**?: (`asset`) => `boolean` \| `Promise`\<`boolean`\>

Custom asset downloader. Given resolved asset, fetches source content and assigns file's full path on
 local file system to the asset (in-place). Return false when the fetcher can't handle the asset,
 in which case it'll be handled by next fetchers in the plugin chain.

#### Parameters

• **asset**: [`FetchedAsset`](FetchedAsset.md)

#### Returns

`boolean` \| `Promise`\<`boolean`\>

### inject?

> **inject**?: () => [`PluginInjection`](PluginInjection.md)[]

When specified, will inject specified client-side content when plugged to bundlers.

#### Returns

[`PluginInjection`](PluginInjection.md)[]

### probe?

> **probe**?: (`asset`) => `boolean` \| `Promise`\<`boolean`\>

Custom content info resolver. Given fetched asset, resolves and assigns media content
 information (in-place). Return false when the implementation can't or shouldn't handle the asset,
 in which case it'll be handled by next probe handlers in the plugin chain.

#### Parameters

• **asset**: [`ProbedAsset`](ProbedAsset.md)

#### Returns

`boolean` \| `Promise`\<`boolean`\>

### resolve?

> **resolve**?: (`asset`) => `boolean` \| `Promise`\<`boolean`\>

Custom asset resolver. Given captured asset syntax, resolves asset type,
 content locations and specs (in-place). Return false when the resolver can't
 handle the asset, in which case it'll be handled by next resolvers in the plugin chain.

#### Parameters

• **asset**: [`ResolvedAsset`](ResolvedAsset.md)

#### Returns

`boolean` \| `Promise`\<`boolean`\>

### rewrite?

> **rewrite**?: (`content`, `assets`, `id`?) => `string` \| `null` \| `Promise`\<`string` \| `null`\>

Custom procedure to rewrite captured assets syntax with built HTML. Given id (filename) and
 content (text) of transformed document return overwritten content or false when can't handle the case,
 in which case it'll be handled by next procedures in the plugin chain.

#### Parameters

• **content**: `string`

• **assets**: [`BuiltAsset`](BuiltAsset.md)[]

• **id?**: `string`

#### Returns

`string` \| `null` \| `Promise`\<`string` \| `null`\>

### serve?

> **serve**?: (`path`, `asset`) => `null` \| `Promise`\<`string` \| `null`\>

Custom asset server. Given full path to a content file and associated asset info,
 return URL under which the file will be served and prepare the file to be served (eg, copy to
 the static assets dir or upload to a CDN). Return null when the server can't
 handle the asset, in which case it'll be handled by next servers in the plugin chain.

#### Parameters

• **path**: `string`

• **asset**: `Readonly`\<[`BuiltAsset`](BuiltAsset.md)\>

#### Returns

`null` \| `Promise`\<`string` \| `null`\>

## Source

[server/config/plugin.ts:4](https://github.com/Elringus/Imgit/blob/f5cda02/src/server/config/plugin.ts#L4)
