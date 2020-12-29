@typedef {function} can-define-stream-kefir.types.DefineList DefineList.prototype
@parent can-define-stream-kefir.types

@description A [can-define/list/list] constructor to add stream methods to.

@signature `new DefineList([items])`

Creates a DefineList constructor

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
```

@body

## Use

See: [can-define/list/list] and the related [can-define/list/list.extend] method.
