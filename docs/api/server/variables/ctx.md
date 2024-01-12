# ctx

> **`const`** **ctx**: `Object`

Shared mutable state of the current build operation.

## Type declaration

### encodes

> **encodes**: `Map`\<`string`, `Promise`\<`void`\>\>

Encode operations mapped by source content location (URL) + encode target.

### fetches

> **fetches**: `Map`\<`string`, `Promise`\<`void`\>\>

Fetched remote content mapped by source location (URL).

### probes

> **probes**: `Map`\<`string`, `Promise`\<[`ContentInfo`](../type-aliases/ContentInfo.md)\>\>

Probing operations mapped by source content location (URL).

### retries

> **retries**: `Map`\<`string`, `number`\>

Fetch retry count mapped by fetched content location (URL).

## Source

[server/context.ts:4](https://github.com/Elringus/Imgit/blob/f5cda02/src/server/context.ts#L4)
