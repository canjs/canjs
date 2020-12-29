@typedef {Object} can-stache.getterSetter getterSetter
@parent can-stache.types

@description The getterSetter argument passed to [can-stache.registerConverter registerConverter].

@type {Object}

An object with a `get` and `set` method that get converted to a two-way helper.

```js
stache.registerConverter( "numberToString", {
	get: function( fooCompute ) {
		return "" + fooCompute();
	},
	set: function( newVal, fooCompute ) {
		fooCompute( +newVal );
	}
} );
```


A `getterSetter` object provides:

 - A `get` method that returns the value
  of the `left` value given the arguments passed on the `right`.
 - a `set` method that updates one or multiple of the `right` arguments
   computes given a new `left` value.

@option {function(*)} get(args...) Takes the arguments from a [can-stache/expressions/call]
and returns a value.

An argument is a compute if the argument has been marked with a tilde (`~`) prefix, otherwise the
value of the argument is the same as the value of the corresponding scope property.
At least one argument should be a compute so `set` can update the value.

@option {function(*,*)} set(setValue,args...) Takes the new value of the `left` side of a
[can-stache-bindings.twoWay {(two-way)} binding] followed by the other arguments to the
[can-stache/expressions/call].  This should change one of the compute arguments.


@body
