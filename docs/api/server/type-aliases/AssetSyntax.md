# AssetSyntax

```ts
type AssetSyntax: Object;
```

Asset syntax captured from transformed document.

## Type declaration

### alt?

```ts
alt?: string;
```

Optional alternate text from captured syntax.

### index

```ts
index: number;
```

First index of the captured syntax text inside transformed document content.

### spec?

```ts
spec?: string;
```

Optional raw (un-parsed) user-defined asset specifications from captured syntax.

### text

```ts
text: string;
```

Full text of the captured syntax.

### url

```ts
url: string;
```

URL from captured syntax; may be direct location of the asset's source content (eg, image link)
 or endpoint for resolving the content, such as REST API or YouTube link.

## Source

[server/asset.ts:8](https://github.com/Elringus/Imgit/blob/fc320a2/src/server/asset.ts#L8)
