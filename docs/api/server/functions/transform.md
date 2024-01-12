# transform()

> **transform**(`content`, `id`?): `Promise`\<`string`\>

Transforms source document (eg, `.md`, `.jsx` or `.html`)
 with specified content replacing configured asset syntax with optimized HTML.

## Parameters

• **content**: `string`

Text content of the document to transform.

• **id?**: `string`

Document's file name or another identifier in the context of build procedure.

## Returns

`Promise`\<`string`\>

Transformed content of the document.

## Source

[server/transform/index.ts:25](https://github.com/Elringus/Imgit/blob/f5cda02/src/server/transform/index.ts#L25)
