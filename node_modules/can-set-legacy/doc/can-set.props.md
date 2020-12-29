@property {Object} can-set-legacy.props props
@parent can-set-legacy.properties

@description Contains a collection of prop generating functions.

@type {Object}

The following functions create `compares` objects that can be mixed together to create a set `Algebra`.

```js
import set from "can-set-legacy";
const algebra = new set.Algebra(
	{

		// ignore this property in set algebra
		sessionId: function() {
			return true;
		}
	},
	set.props.boolean( "completed" ),
	set.props.rangeInclusive( "start", "end" )
);
```
