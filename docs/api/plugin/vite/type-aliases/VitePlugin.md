# VitePlugin

> **VitePlugin**: `Object`

## Type declaration

### buildEnd

> **buildEnd**: (`error`?) => `Promise`\<`void`\> \| `void`

#### Parameters

• **error?**: `Error`

#### Returns

`Promise`\<`void`\> \| `void`

### buildStart

> **buildStart**: (`options`) => `Promise`\<`void`\> \| `void`

#### Parameters

• **options**: `unknown`

#### Returns

`Promise`\<`void`\> \| `void`

### enforce

> **enforce**: `"pre"` \| `"post"`

### name

> **name**: `string`

### transform

> **transform**: (`code`, `id`, `options`?) => `Promise`\<`string`\> \| `string`

#### Parameters

• **code**: `string`

• **id**: `string`

• **options?**: `Object`

• **options\.ssr?**: `boolean`

#### Returns

`Promise`\<`string`\> \| `string`

### transformIndexHtml

> **transformIndexHtml**: `Object`

### transformIndexHtml.handler

> **transformIndexHtml.handler**: (`html`, `ctx`) => `Promise`\<`Object`\>

#### Parameters

• **html**: `string`

• **ctx**: `Object`

• **ctx\.filename**: `string`

#### Returns

`Promise`\<`Object`\>

> ##### html
>
> > **html**: `string`
>
> ##### tags
>
> > **tags**: [`HtmlTag`](HtmlTag.md)[]
>

### transformIndexHtml.order

> **transformIndexHtml.order**: `"pre"` \| `"post"`

## Source

[plugin/vite.ts:12](https://github.com/Elringus/Imgit/blob/cf06d86/src/plugin/vite.ts#L12)
