# AssetSpec

> **AssetSpec**: `Object`

Per-asset specifications assigned by the user.

## Type declaration

### class?

> **class**?: `string`

When specified, adds specified class attribute to generated HTML container.

### eager?

> **eager**?: `boolean`

When set to `true` the asset will be loaded eagerly (instead of default lazy).
 Use for above the fold content, ie initially visible w/o scrolling, such as hero image.

### media?

> **media**?: `string`

Media attribute to specify for applicable source tag. Can be used with the "merge" spec
 for art direction. Example below will show "wide.png" when window width is 800px or more
 and switch to "narrow.png" when the window width is equal to or below 799px.

#### Example

```md
 ![?media=(min-width:800px)](/wide.png)
 ![?media=(max-width:799px)&merge](/narrow.png)
 ```

### merge?

> **merge**?: `boolean`

When set to `true` syntax will be merged with the previous one in the document.
 Can be used to specify multiple sources with different specs for a single asset.

### width?

> **width**?: `number`

Width threshold for the asset content, in pixels.
 Overrides global `width` parameter.

## Source

[server/asset.ts:37](https://github.com/Elringus/Imgit/blob/f5cda02/src/server/asset.ts#L37)
