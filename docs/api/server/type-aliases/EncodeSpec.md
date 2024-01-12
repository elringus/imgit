# EncodeSpec

> **EncodeSpec**: `Object`

Configures transformation to use when encoding.

## Type declaration

### blur?

> **blur**?: `number`

Apply blur with intensity in 0.0 to 1.0 range.

### codec?

> **codec**?: `string`

Video codec to use; detects automatically based on container when not specified.

### ext

> **ext**: `string`

Media container to use in format of out file extension, w/o dot; eg, `mp4`.

### scale?

> **scale**?: `number`

Scale to the specified ratio preserving the aspect.

### select?

> **select**?: `number`

Select frame with specified index (0-based) instead of encoding full stream.

## Source

[server/config/options.ts:105](https://github.com/Elringus/Imgit/blob/f5cda02/src/server/config/options.ts#L105)
