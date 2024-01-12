# AstroIntegration

```ts
type AstroIntegration: Object;
```

## Type declaration

### hooks

```ts
hooks: Object;
```

### hooks.astro:config:setup?

```ts
hooks.astro:config:setup?: (options) => void | Promise<void>;
```

#### Parameters

• **options**: `Object`

• **options\.injectScript**: [`AstroInjector`](AstroInjector.md)

• **options\.updateConfig**: (`config`) => `void`

#### Returns

`void` \| `Promise`\<`void`\>

### name

```ts
name: string;
```

## Source

[plugin/astro.ts:6](https://github.com/Elringus/Imgit/blob/157689c/src/plugin/astro.ts#L6)
