@property {function} can-observe.resolver resolver
@parent can-observe/decorators

@description Create observable key-value instances or types.

@signature `@observe.resolver`

The `@resolver` decorator provides a powerful and generic interface for providing custom functionality without having to deal with the underlying observation. The resolved value is accessed on the instance as a getter.

When attached to a method, it passes an argument with several properties:
* *resolve* - Update the value to be the passed argument.
* *listenTo* - Listen for changes to this key on the instance, calling a callback when it changes.
* *stopListening* - Stop listening for changes to this key.
* *lastSet* - The last value that was set.

This example will return a value that counts how many times the `value` property was changed. The resolved value would be accessed as `thing.count` (as a getter).

```js
import observe from "can-observe";

class Thing extends observe.Object {
	@@observe.resolver
	count( { resolve, listenTo } ) {
		let count = 0;
		resolve( count );

		listenTo( "value", () => {
			resolve( ++count );
		} );
	}
}
```
