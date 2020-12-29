@typedef {String} can-stache/expressions/call Call Expression
@parent can-stache/expressions


@signature `{{ method( [EXPRESSION...] ) }}`

Calls `method` with zero or many arguments where each argument
is a comma separated
`EXPRESSION`.

```
method(1,key,hashProp=hashValue,call(),helper expression)
```


@param {can-stache/expressions/literal|can-stache/expressions/key-lookup|can-stache/expressions/hash|can-stache/expressions/call|can-stache/expressions/helper} EXPRESSION An expression that will be passed as an argument
to `method`.


@body

## Use

A call expression calls a function looked up in the [can-view-scope scope] followed by
the [can-view-scope.Options helpers scope]. It looks like:

```html
<!-- Template -->
<h1>{{pluralize(type,ages.length)}}</h1>
```

```js
{
	pluralize: function( type, count ) {
		return type + ( count === 1 ? "" : "s" );
	},
	todos: new List( [ 22, 32, 42 ] ),
	type: "age"
}
```

```html
<!-- Result -->
<h1>Ages</h1>
```

Call expression arguments are comma (,) separated.  If a [can-stache/expressions/hash] is an argument,
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
	todos: new List( [ 22, 32, 42 ] ),
	type: "age"
}
```

```html
<!-- Result -->
<h1>Ages</h1>
```
