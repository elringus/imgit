# FetchOptions

> **FetchOptions**: `Object`

Configures remote assets downloading behaviour.

## Type declaration

### delay

> **delay**: `number`

How long to wait before restarting a failed download, in seconds; 6 by default.

### retries

> **retries**: `number`

How many times to restart the download when request fails; 3 by default.

### root

> **root**: `string`

Local directory to store downloaded remote content files;
 `./public/imgit/fetched` by default.

### timeout

> **timeout**: `number`

How long to wait when downloading remote asset, in seconds; 30 by default.

## Source

[server/config/options.ts:43](https://github.com/Elringus/Imgit/blob/f5cda02/src/server/config/options.ts#L43)
