@typedef {String} can-stache/expressions/literal Literal Expression
@parent can-stache/expressions

Specify a JavaScript primitive type.

@signature `"string" | 'string'`

Specifies a string.

```html
{{myHelper( "this is a string" )}}
```

@signature `\-[0-9]+\.?[0-9]*`

Specifies a number.

```html
{{myHelper( 5.2 )}}
```

@signature `null | undefined | true | false`

Specifies a JavaScript `null`, `undefined`, `true`, or `false` value.

```html
{{myHelper( false )}}
```

@body

## Use

Literal expressions are usually passed as arguments to [can-stache/expressions/call] or [can-stache/expressions/helper]s like:

```html
{{task.filter("completed", true)}}
{{pluralize "dog" 2}}
```
