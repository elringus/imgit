# ctx

```ts
const ctx: Object;
```

Shared mutable state of the current build operation.

## Type declaration

### encodes

```ts
encodes: Map<string, Promise<void>>;
```

Encode operations mapped by source content location (URL) + encode target.

### fetches

```ts
fetches: Map<string, Promise<void>>;
```

Fetched remote content mapped by source location (URL).

### probes

```ts
probes: Map<string, Promise<ContentInfo>>;
```

Probing operations mapped by source content location (URL).

### retries

```ts
retries: Map<string, number>;
```

Fetch retry count mapped by fetched content location (URL).

## Source

[server/context.ts:4](https://github.com/Elringus/Imgit/blob/157689c/src/server/context.ts#L4)
