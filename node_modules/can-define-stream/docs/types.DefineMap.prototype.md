@typedef {function} can-define-stream.types.DefineMap DefineMap.prototype
@parent can-define-stream.types

@description A [can-define/map/map] constructor to add stream methods to.

@signature `new DefineMap({props})`

Creates a DefineMap type instance

```js
import DefineMap from "can-define/map/map";

const Person = DefineMap.extend( {
	first: "string",
	last: "string",
	fullName: {
		get() {
			return this.first + " " + this.last;
		}
	}
} );

const john = new Person( {
	first: "John",
	last: "Gardner"
} );
```

@body

## Use

See: [can-define/map/map] and [can-define/map/map.extend]
