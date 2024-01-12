# HtmlTag

```ts
type HtmlTag: Object;
```

## Type declaration

### attrs?

```ts
attrs?: Record<string, string | boolean>;
```

### children?

```ts
children?: string | HtmlTag[];
```

### injectTo?

```ts
injectTo?: "head" | "body" | "head-prepend" | "body-prepend";
```

### tag

```ts
tag: string;
```

## Source

[plugin/vite.ts:25](https://github.com/Elringus/Imgit/blob/fc320a2/src/plugin/vite.ts#L25)
