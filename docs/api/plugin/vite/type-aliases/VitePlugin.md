# VitePlugin

```ts
type VitePlugin: Object;
```

## Type declaration

### buildEnd

```ts
buildEnd: (error?) => Promise<void> | void;
```

#### Parameters

• **error?**: `Error`

#### Returns

`Promise`\<`void`\> \| `void`

### buildStart

```ts
buildStart: (options) => Promise<void> | void;
```

#### Parameters

• **options**: `unknown`

#### Returns

`Promise`\<`void`\> \| `void`

### enforce

```ts
enforce: "pre" | "post";
```

### name

```ts
name: string;
```

### transform

```ts
transform: (code, id, options?) => Promise<string> | string;
```

#### Parameters

• **code**: `string`

• **id**: `string`

• **options?**: `Object`

• **options\.ssr?**: `boolean`

#### Returns

`Promise`\<`string`\> \| `string`

### transformIndexHtml

```ts
transformIndexHtml: Object;
```

### transformIndexHtml.handler

```ts
transformIndexHtml.handler: (html, ctx) => Promise<Object>;
```

#### Parameters

• **html**: `string`

• **ctx**: `Object`

• **ctx\.filename**: `string`

#### Returns

`Promise`\<`Object`\>

> ##### html
>
> ```ts
> html: string;
> ```
>
> ##### tags
>
> ```ts
> tags: HtmlTag[];
> ```
>

### transformIndexHtml.order

```ts
transformIndexHtml.order: "pre" | "post";
```

## Source

[plugin/vite.ts:12](https://github.com/Elringus/Imgit/blob/157689c/src/plugin/vite.ts#L12)
