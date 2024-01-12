# default()

```ts
default(prefs?, platform?): AstroIntegration
```

Creates imgit integration instance for astro.

## Parameters

• **prefs?**: [`Prefs`](../../../server/type-aliases/Prefs.md)

Plugin preferences; will use pre-defined defaults when not assigned.

• **platform?**: [`Platform`](../../../server/type-aliases/Platform.md)

Runtime APIs to use; will attempt to detect automatically when not assigned.

## Returns

[`AstroIntegration`](../type-aliases/AstroIntegration.md)

## Source

[plugin/astro.ts:22](https://github.com/Elringus/Imgit/blob/fc320a2/src/plugin/astro.ts#L22)
