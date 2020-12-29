@typedef {function} can-define-stream-kefir.types.DefineMap DefineMap.prototype
@parent can-define-stream-kefir.types

@description A [can-define/map/map] constructor to add stream methods to.

@signature `new DefineMap({props})`

Creates a DefineMap constructor

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
```

@body

## Use

See: [can-define/map/map] and [can-define/map/map.extend]
