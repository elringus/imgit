# PluginInjection

```ts
type PluginInjection: Object;
```

Used to inject client-side content for a plugin.

## Type declaration

### src

```ts
src: string;
```

Full path to the injected file on local file system.

### type

```ts
type: "module" | "css";
```

Whether injected content is a JS module or CSS stylesheet.

## Source

[server/config/plugin.ts:44](https://github.com/Elringus/Imgit/blob/fc320a2/src/server/config/plugin.ts#L44)
