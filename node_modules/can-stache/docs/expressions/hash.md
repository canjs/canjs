@typedef {String} can-stache/expressions/hash Hash Expression
@parent can-stache/expressions

@signature `[PROPERTY_NAME=EXPRESSION ]+`

A sequence of one or more property names and their values as another expression like:

```
prop1=1 prop2=key prop3=callExpression()
```

In a [can-stache/expressions/call], `Hash` expressions
create an object argument with the specified `PROPERTY_NAME` properties
and `EXPRESSION` values.

The following template:

```
{{ method( age=5 first=person.firstName last=person.getLastName() ) }}
```

Might call `method` with:

```js
{ age: 5, first: "Justin", last: "Meyer" }
```

In a [can-stache/expressions/helper], `Hash` expressions
add to the [can-stache.helperOptions]’s `hash` object with the specified `PROPERTY_NAME` properties
and `EXPRESSION` values.

The following template:

```
{{ method age=5 first=person.firstName last=person.getLastName() }}
```

Might call `method` with:

```js
{
	hash: { age: 5, first: compute( "Justin" ), last: compute( "Meyer" ) }
}
```


@param {String} PROPERTY_NAME The property name on the call expression
argument object or [can-stache.helperOptions]’s `hash` object.

@param {can-stache/expressions/literal|can-stache/expressions/key-lookup|can-stache/expressions/call} EXPRESSION An expression that provides a
value for the property name.

@body

## Use

A hash expression specifies a property value on a object argument in a call expression
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
