# CacheOptions

```ts
type CacheOptions: Object;
```

Configures server cache.

## Type declaration

### root

```ts
root: string;
```

Local directory where the build cache files are stored. When building static apps (SPA) on CI,
 consider checking-in the cache directory to boost remote build processes;
 `./public/imgit` by default.

## Source

[server/config/options.ts:35](https://github.com/Elringus/Imgit/blob/fc320a2/src/server/config/options.ts#L35)
