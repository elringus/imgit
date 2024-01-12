# VitePrefs

> **VitePrefs**: [`Prefs`](../../../server/type-aliases/Prefs.md) & `Object`

Configures vite plugin behaviour.

## Type declaration

### inject?

> **inject**?: `boolean`

Whether to inject imgit client JavaScript module to index HTML; enabled by default.

### skip?

> **skip**?: (`filename`) => `boolean`

Specify condition when document shouldn't be transformed by the vite plugin.

#### Parameters

• **filename**: `string`

#### Returns

`boolean`

## Source

[plugin/vite.ts:4](https://github.com/Elringus/Imgit/blob/f5cda02/src/plugin/vite.ts#L4)
