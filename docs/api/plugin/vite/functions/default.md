# default()

```ts
default(prefs?, platform?): VitePlugin
```

Creates imgit plugin instance for vite.

## Parameters

• **prefs?**: [`VitePrefs`](../type-aliases/VitePrefs.md)

Plugin preferences; will use pre-defined defaults when not assigned.

• **platform?**: [`Platform`](../../../server/type-aliases/Platform.md)

Runtime APIs to use; will attempt to detect automatically when not assigned.

## Returns

[`VitePlugin`](../type-aliases/VitePlugin.md)

## Source

[plugin/vite.ts:35](https://github.com/Elringus/Imgit/blob/fc320a2/src/plugin/vite.ts#L35)
