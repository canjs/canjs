@typedef {String} can-stache/keys/compute ~compute
@parent can-stache/keys

Pass a compute instead of a value if an observable is found within
[can-stache/expressions/call].

@signature `~key`

This makes non-helper expression arguments behave similarly to helper
expression arguments.

```html
{{#each(~todos)}} ... {{/each}}
```

@body

## Use

The following illustrates what `~some.key` would return given
different data structures:

```js
// A non-observable JS object:
const data1 = { some: { key: "value" } };

//-> "value"

// A non-observable JS object w/ a function at the end
const data2 = { some: { key: function() {
	return "value";
} } };

//-> "value"

// A non-observable JS object with intermediate functions:
const data3 = { some: function() {
	return { key: "value" };
} };

//-> "value"

// A observable can-map
const data4 = { some: new ObservableObject( { key: "value" } ) };

//-> canCompute("value")

// A method on an observable can-map that reads observables
class Some extends ObservableObject {
	static props = {
		value: String,
	};

	key() {
		return this.value;
	}
}
const data5 = { some: new Some( { value: "value" } ) };

//-> compute(function(){ return this.value; })
```

Notice that `~` should only be used once in a value lookup expression.
