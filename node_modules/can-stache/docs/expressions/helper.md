@typedef {String} can-stache/expressions/helper Helper Expression
@parent can-stache/deprecated

@deprecated {4.15.0} Use [can-stache.expression.call] instead.

@signature `method [EXPRESSION...]`

Calls `method` with zero or many arguments where each argument
is a space separated
`EXPRESSION`.  



```
{{method 1 key call() hashProp=hashValue}}
```

@param {can-stache/expressions/literal|can-stache/expressions/key-lookup|can-stache/expressions/hash|can-stache/expressions/call} EXPRESSION An expression that will be passed as an argument
to `method`.


All [can-stache/expressions/hash]s will be collectively
added to the [can-stache.helperOptions]’s `hash` object.

If an `EXPRESSION` reads an observable, a
[can-compute.computed] will be passed to `method`.



@body

## Use

A helpers expression calls a function looked up in the [can-view-scope.Options helpers scope] followed by
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
