# Platform

> **Platform**: `Record`\<`string`, `unknown`\> & `Object`

Platform-specific APIs used in build operations.

## Type declaration

### base64

> **base64**: (`data`) => `Promise`\<`string`\>

Encodes specified binary data to base64 string.

#### Parameters

• **data**: `Uint8Array`

#### Returns

`Promise`\<`string`\>

### exec

> **exec**: (`cmd`) => `Promise`\<`Object`\>

Executes specified command in system shell.

#### Parameters

• **cmd**: `string`

#### Returns

`Promise`\<`Object`\>

> ##### err?
>
> > **err**?: `Error`
>
> ##### out
>
> > **out**: `string`
>

### fetch

> **fetch**: (`url`, `abort`?) => `Promise`\<`Response`\>

Fetches a remote resource with specified url.

#### Parameters

• **url**: `string`

• **abort?**: `AbortSignal`

#### Returns

`Promise`\<`Response`\>

### fs

> **fs**: `Object`

Local file system access APIs.

### fs.exists

> **fs.exists**: (`path`) => `Promise`\<`boolean`\>

Returns whether directory or file with specified path exists.

#### Parameters

• **path**: `string`

#### Returns

`Promise`\<`boolean`\>

### fs.mkdir

> **fs.mkdir**: (`path`) => `Promise`\<`void`\>

Creates directory with specified path (recursive).

#### Parameters

• **path**: `string`

#### Returns

`Promise`\<`void`\>

### fs.read

> **fs.read**: \<`T`\>(`path`, `encoding`) => `Promise`\<`T` extends `"bin"` ? `Uint8Array` : `string`\>

Returns content of the file with specified path and encoding.

#### Type parameters

• **T** extends `"bin"` \| `"utf8"`

#### Parameters

• **path**: `string`

• **encoding**: `T`

#### Returns

`Promise`\<`T` extends `"bin"` ? `Uint8Array` : `string`\>

### fs.remove

> **fs.remove**: (`path`) => `Promise`\<`void`\>

Deletes file with specified path.

#### Parameters

• **path**: `string`

#### Returns

`Promise`\<`void`\>

### fs.size

> **fs.size**: (`path`) => `Promise`\<`number`\>

Returns size of the file with specified path, in bytes.

#### Parameters

• **path**: `string`

#### Returns

`Promise`\<`number`\>

### fs.write

> **fs.write**: (`path`, `content`) => `Promise`\<`void`\>

Writes binary array or UTF-8 encoded string to the file with specified path.

#### Parameters

• **path**: `string`

• **content**: `Uint8Array` \| `string`

#### Returns

`Promise`\<`void`\>

### log

> **log**: `Object`

Logging and reporting APIs.

### log.err

> **log.err**: (`msg`) => `void`

Logs error message.

#### Parameters

• **msg**: `string`

#### Returns

`void`

### log.info

> **log.info**: (`msg`) => `void`

Logs informational message.

#### Parameters

• **msg**: `string`

#### Returns

`void`

### log.tty

> **log.tty**: (`msg`) => `void`

Clears current line and writes to stdout when text terminal is available,
 ignores otherwise; used for reporting build progress.

#### Parameters

• **msg**: `string`

#### Returns

`void`

### log.warn

> **log.warn**: (`msg`) => `void`

Logs warning message.

#### Parameters

• **msg**: `string`

#### Returns

`void`

### path

> **path**: `Object`

File system path APIs. All results are expected with forward slashes (even on Windows).

### path.basename

> **path.basename**: (`path`) => `string`

Extracts file name with extension from specified path.

#### Parameters

• **path**: `string`

#### Returns

`string`

### path.dirname

> **path.dirname**: (`path`) => `string`

Extracts directory name from specified path and normalizes the result.

#### Parameters

• **path**: `string`

#### Returns

`string`

### path.fileUrlToPath

> **path.fileUrlToPath**: (`url`) => `string`

Converts specified file URL (usually `import.meta.url`) to local file path.

#### Parameters

• **url**: `string`

#### Returns

`string`

### path.join

> **path.join**: (...`paths`) => `string`

Joins specified path parts and normalizes the result.

#### Parameters

• ...**paths**: `string`[]

#### Returns

`string`

### path.relative

> **path.relative**: (`from`, `to`) => `string`

Builds relative path from specified 'from' path to 'to' path.

#### Parameters

• **from**: `string`

• **to**: `string`

#### Returns

`string`

### path.resolve

> **path.resolve**: (...`paths`) => `string`

Builds absolute path from specified parts and normalizes the result.

#### Parameters

• ...**paths**: `string`[]

#### Returns

`string`

### wait

> **wait**: (`seconds`) => `Promise`\<`void`\>

Returns promise resolved after specified number of seconds.

#### Parameters

• **seconds**: `number`

#### Returns

`Promise`\<`void`\>

## Source

[server/platform/platform.ts:2](https://github.com/Elringus/Imgit/blob/cf06d86/src/server/platform/platform.ts#L2)
