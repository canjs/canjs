@typedef {function} can-define-stream.types.DefineList DefineList.prototype
@parent can-define-stream.types

@description A [can-define/list/list] constructor to add stream methods to.

@signature `new DefineList([items])`

Creates a DefineList type instance

```js
import DefineMap from "can-define/map/map";
import DefineList from "can-define/list/list";

const People = DefineList.extend( {
	"#": {
		type: {
			first: "string",
			last: "string"
		}
	}
} );

const people = new People( [
	{ first: "John", last: "Gardner" },
	{ first: "Justin", last: "Meyer" }
] );
```

@body

## Use

See: [can-define/list/list] and the related [can-define/list/list.extend] method.
