@typedef {String} can-stache/expressions/key-lookup KeyLookup Expression
@parent can-stache/expressions

@signature `key`

A [can-stache.key KeyLookup expression] specifies a value in the [can-view-scope scope] or
[can-view-scope.Options HelperOptions scope] that will be looked up.  KeyLookup expressions
can be the entire stache expression like:

```html
{{key}}
```

Or they can makeup the method, helper, arguments and hash value parts of
[can-stache/expressions/call],
[can-stache/expressions/helper], and [can-stache/expressions/hash]s:

```html
{{method(arg1,arg2}}          Call
{{helper arg1 arg2}}          Helper
{{method( prop=hashValue )}}  Hash
```

@signature `CALL_EXPRESSION.key`

Looks up `key` on the return value of `CALL_EXPRESSION`.

```html
{{#each(Todo.getList(complete=completed).value)}}
```

  @param {can-stache/expressions/call} CALL_EXPRESSION A
  call expression that may or may not return a value.

  @param {String} key A property value to look up on
  the result of `CALL_EXPRESSION`.

@body

## Use



The value returned up by a KeyLookup depends on what the [can-stache.key] looks like, and
what expression type the KeyLookup is within.

For example, `{{method(~./key)}}` will call `method` with
a [can-compute.computed compute] that looks up the value of `key` only in the top of the [can-view-scope scope].

The rules are as follows:

 - __[can-stache/expressions/call] arguments__ `{{method(key)}}` - values are passed.
 - __[can-stache/expressions/helper] arguments__ `{{helper key}}` - computes are passed.
 - __hash value in [can-stache/expressions/call]__ `{{method(hash=key)}}` - values are set as property values.
 - __hash value in [can-stache/expressions/helper]__ `{{method hash=key}}` - computes are set as property values.
 - __[can-stache/keys/compute compute operator]__ `{{method(~key)}}` - pass a compute instead of a value.
 - __[can-stache/keys/current current operator]__ `{{./key}}` - only lookup key at the top of the scope.
 - __[can-stache/keys/parent parent operator]__ `{{../key}}` - lookup the value in the parent context.
 - __[can-stache/keys/this context key]__ `{{this}}` - return the current context/top of the scope.

@body

## Default key return values by expression and data types

Keys can have slightly different default behavior depending if they are used in:

 - [can-stache/expressions/helper helper arguments] like: `{{helper some.key}}`

when compared to the other places they are used:

 - [can-stache.tags.escaped insertion tags] like: `{{some.key}}`
 - [can-stache/expressions/call call-expression arguments] like: `{{helper(some.key)}}`
 - [can-stache-bindings.event event bindings] like: `($click)="method(some.key)"`
 - [can-stache-bindings data bindings] like: `{some-attr}="some.key"`

Furthermore keys return different values depending on the data type.

In general:

 - Keys in helper expression arguments that find observable data return
   a [can-compute.computed] that represents the value.
 - Keys in other expressions return the value.
 - If no observable data is found, the key’s value is returned in all expressions.

The following illustrates what `some.key` would return given
different data structures as a [can-stache/expressions/helper] and in all other expressions.

```js
// A non-observable JS object:
const data1 = { some: { key: "value" } };

// Helper -> "value"
// Other  -> "value"

// A observable can-map
const data4 = { some: new Map( { key: "value" } ) };

// Helper -> canCompute("value")
// Other  -> "value"

// A method on an observable can-map that reads observables
const Some = Map.extend( { key: function() {
	return this.attr( "value" );
} } );
const data5 = { some: new Some( { value: "value" } ) };

// Helper -> canCompute("value")
// Other  -> "value"
```
