# boot()

> **boot**(`prefs`?, `platform`?): `Promise`\<`void`\>

Initializes build context with specified options.

## Parameters

• **prefs?**: [`Prefs`](../type-aliases/Prefs.md)

Build preferences; will use pre-defined defaults when not assigned.

• **platform?**: [`Platform`](../type-aliases/Platform.md)

Runtime APIs to use; will attempt to detect automatically when not assigned.

## Returns

`Promise`\<`void`\>

## Source

[server/index.ts:17](https://github.com/Elringus/Imgit/blob/f5cda02/src/server/index.ts#L17)
