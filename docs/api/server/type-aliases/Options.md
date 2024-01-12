# Options

> **Options**: `Object`

Configures server behaviour.

## Type declaration

### build

> **build**: `"html"` \| `"jsx"`

The type of syntax to build; html by default.

### cache

> **cache**: [`CacheOptions`](CacheOptions.md) \| `null`

Configure build artifacts caching; assign `null` to disable caching.

### cover?

> **cover**?: `string` \| `null`

Image source to show while content is loading. When per-asset cover generation is enabled
 in encode options, will use specified source as a fallback for legacy browsers (lacking avif support),
 otherwise will use the source for all covers; assign `null` to disable covers completely.

### encode

> **encode**: [`EncodeOptions`](EncodeOptions.md)

Configure content encoding.

### fetch

> **fetch**: [`FetchOptions`](FetchOptions.md)

Configure remote content fetching.

### plugins

> **plugins**: [`Plugin`](Plugin.md)[]

External imgit extensions; use to override or extend server behaviour.

### regex

> **regex**: `RegExp`[]

Regular expressions to use for capturing transformed assets syntax.
 Expects `<url>`, `<alt>` and `<spec>` capture groups (alt and spec are optional).
 By default, captures Markdown image syntax with spec defined as query params after alt:
 `!\[(?<alt>.*?)(?<spec>\?\S+?)?]\((?<url>\S+?)\)`

### root

> **root**: `string`

Local directory under which project's static files are stored. Required to resolve
 file paths of relative content sources; `./public` by default.

### width

> **width**: `number` \| `null`

Default width threshold for the transformed assets, in pixels. When source asset is larger,
 will downscale it while preserving the original aspect. In case the source is 2x or larger,
 will as well generate additional "dense" variant that will be shown on high-dpi displays.
 This option is ignored when asset has width explicitly assigned via spec syntax.

## Source

[server/config/options.ts:4](https://github.com/Elringus/Imgit/blob/f5cda02/src/server/config/options.ts#L4)
