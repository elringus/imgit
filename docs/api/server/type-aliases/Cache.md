# Cache

> **Cache**: `Record`\<`string`, `unknown`\> & `Object`

Cached results of the build operations. Each property is persisted as a
 standalone JSON file between build runs. Custom properties can be added.

## Type declaration

### covers

> **covers**: `Record`\<`string`, `string`\>

Base64-encoded generated cover images mapped by asset's syntax URL.

### probes

> **probes**: `Record`\<`string`, [`ContentInfo`](ContentInfo.md)\>

Results of the asset source content probing, mapped by content URL.

### sizes

> **sizes**: `Record`\<`string`, `number`\>

Sizes of the asset source content in bytes, mapped by content URL.

### specs

> **specs**: `Record`\<`string`, [`EncodeSpec`](EncodeSpec.md)\>

Encode specifications used for the last encode pass, mapped by content URL.

## Source

[server/cache.ts:7](https://github.com/Elringus/Imgit/blob/f5cda02/src/server/cache.ts#L7)
