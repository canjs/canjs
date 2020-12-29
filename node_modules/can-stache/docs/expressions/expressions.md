@page can-stache.expressions Expressions
@parent can-stache.pages 2

In addition to different magic tag types, stache supports different expression
types.  These can be used in various combinations to call [can-stache.addLiveHelper helper methods]
or [can-component.prototype.ViewModel viewModel methods].  The following is an example of all the expressions
combined:

```html
{{helper key1 "string" method(key2, 1, prop1=key3) prop2=key4}}
```

There are 6 expression types stache supports:

 - Literal expressions like `{{"string"}}`
 - KeyLookup expressions like `{{key}}`
 - Hash expressions like `{{prop=key}}`
 - Call expressions like `{{method(arg)}}`
 - Helper expressions like `{{helper arg}}`
 - Bracket expressions like `{{[key]}}`

## Literal expressions

A [can-stache/expressions/literal] specifies JS primitive values like:

- Strings `"strings"`
- Numbers `5`
- Booleans `true` or `false`
- And `null` or `undefined`

They are usually passed as arguments to Call or Helper expressions like:

```html
{{pluralize "dog" 2}}
{{task.filter("completed", true)}}
```

## KeyLookup expressions

A [can-stache/expressions/key-lookup] specifies a value in the [can-view-scope scope] or
[can-view-scope.Options HelperOptions scope] that will be looked up. KeyLookup expressions
can be the entire stache expression like:

```html
{{key}}
```

Or they can make up the method, helper, arguments, and hash value parts of
Call, Helper, and Hash expressions:

```html
{{method(arg1,arg2}}          Call
{{helper arg1 arg2}}          Helper
{{method( prop=hashValue )}}  Hash
```

The value returned up by a KeyLookup depends on what the [can-stache.key] looks like, and
what expression type the KeyLookup is within.

For example, `{{method(~./key)}}` will call `method` with
a [can-compute.computed compute] that looks up the value of `key` only in the top of the [can-view-scope scope].

The rules are as follows:

 - __call expression arguments__ `{{method(key)}}` - values are passed.
 - __helper expression arguments__ `{{helper key}}` - computes are passed.
 - __hash value in call expression__ `{{method(hash=key)}}` - values are set as property values.
 - __hash value in helper expression__ `{{method hash=key}}` - computes are set as property values.
 - __special operator__ `{{%index}}` - lookup values in a special context provided by some helpers.
 - __compute operator__ `{{method(~key)}}` - pass a compute instead of a value.
 - __at operator__ `{{method(@key}}` - pass a function instead of trying to read the value of the function.
 - __current context__ `{{./key}}` - only lookup key at the top of the scope.
 - __parent context__ `{{../key}}` - lookup the value in the parent context.
 - __context__ `{{.}}` - return the current context/top of the scope.

## Hash expressions

A [can-stache/expressions/hash] specifies a property value on a object argument in a call expression
and property value on the the hash object in a helper expression’s [can-stache.helperOptions] argument.

For example, in a call expression:

```html
<!-- Template -->
{{methodA(prop=key)}}
  {{methodB(propX=key propY='literal', propZ=5)}}
```

```js
{
	methodA: function( arg ) {},
	methodB: function( arg1, arg2 ) {},
	key: compute( "value" )
}
```

 - `methodA` will be called with `{prop: "value"}` as `arg`.
 - `methodB` will be called with `{propX: "value", propY: 'literal'}` as `arg1` and `{propZ: 5}` as `arg2`

In a helper expression:

```html
<!-- Template -->
{{methodA prop=key}}
  {{methodB(propX=key propY='literal' propZ=5)}}
```

```js
{
	methodA: function( options ) {},
	methodB: function( options ) {},
	key: compute( "value" )
}
```

 - `methodA` will be called with `{prop: compute("value")}` as `options.hash`.
 - `methodB` will be called with `{propX: "value", propY: 'literal', propZ: 5}` as `options.hash`.

## Call expressions

A [can-stache/expressions/call] calls a function looked up in the [can-view-scope scope] followed by
the [can-view-scope.Options helpers scope]. It looks like:

```html
<!-- Template -->
<h1>{{pluralize(type, ages.length)}}</h1>
```

```js
{
	pluralize: function( type, count ) {
		return type + ( count === 1 ? "" : "s" );
	},
	ages: new List( [ 22, 32, 42 ] ),
	type: "age"
}
```

```html
<!-- Result -->
<h1>Ages</h1>
```

Call expression arguments are comma (,) separated.  If a Hash expression is an argument,
an object with the hash properties and values will be passed. For example:

```html
<!-- Template -->
<h1>{{pluralize(word=type count=ages.length)}}</h1>
```

```js
{
	pluralize: function( options ) {
		return options.word + ( options.count === 1 ? "" : "s" );
	},
	ages: new List( [ 22, 32, 42 ] ),
	type: "age"
}
```

```html
<!-- Result -->
<h1>Ages</h1>

```

## Helper expressions

A [can-stache/expressions/helper] calls a function looked up in the [can-view-scope.Options helpers scope] followed by
the [can-view-scope scope]. It looks like:

```html
<!-- Template -->
<h1>{{pluralize type ages.length}}</h1>
```

```js
{
	pluralize: function( type, count ) {
		return "data-pluralize";
	},
	todos: new List( [ 22, 32, 42 ] ),
	type: "age"
}
```

```js
{
	pluralize: function( type, count ) {
		return type + ( count() === 1 ? "" : "s" );
	}
}
```

```html
<!-- Result -->
<h1>Ages</h1>
```

Helper expression arguments that are observable are passed a compute.  This is
in contrast to Call expressions that get passed the value.

Helper expression arguments are space separated.  If a Hash expression is an argument,
the hash properties and values will be added to the helper options object. For example:

```html
<!-- Template -->
<h1>{{pluralize word=type count=ages.length}}</h1>
```

```js
{
	todos: new List( [ 22, 32, 42 ] ),
	type: "age"
}
```

```js
{
	pluralize: function( helperOptions ) {
		return helperOptions.hash.type + ( helperOptions.hash.count() === 1 ? "" : "s" );
	}
}
```

```html
<!-- Result -->
<h1>Ages</h1>
```

## Bracket expressions

A [can-stache/expressions/bracket] can be used to look up a dynamic property in the [can-view-scope scope]. This looks like:

```html
<!-- Template -->
<h1>{{[key]}}</h1>
```

```js
{
	key: "name",
	name: "Kevin"
}
```

```html
<!-- Result -->
<h1>Kevin</h1>
```

This can be useful for looking up values using keys containing non-alphabetic characters:

```html
<!-- Template -->
<h1>{{["person:name"]}}</h1>
```

```js
{
	"person:name": "Kevin"
}
```

```html
<!-- Result -->
<h1>Kevin</h1>
```

Bracket expressions can also be used to look up a value in the result of another expression:

```html
<!-- Template -->
{{getPerson()[key]}}
```

```js
{
	key: "name",
	getPerson: function() {
		return {
			name: "Kevin"
		};
	}
}
```

```html
<!-- Result -->
<h1>Kevin</h1>
```
