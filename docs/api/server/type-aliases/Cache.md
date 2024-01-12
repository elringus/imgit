# Cache

```ts
type Cache: Record<string, unknown> & Object;
```

Cached results of the build operations. Each property is persisted as a
 standalone JSON file between build runs. Custom properties can be added.

## Type declaration

### covers

```ts
covers: Record<string, string>;
```

Base64-encoded generated cover images mapped by asset's syntax URL.

### probes

```ts
probes: Record<string, ContentInfo>;
```

Results of the asset source content probing, mapped by content URL.

### sizes

```ts
sizes: Record<string, number>;
```

Sizes of the asset source content in bytes, mapped by content URL.

### specs

```ts
specs: Record<string, EncodeSpec>;
```

Encode specifications used for the last encode pass, mapped by content URL.

## Source

[server/cache.ts:7](https://github.com/Elringus/Imgit/blob/fc320a2/src/server/cache.ts#L7)
