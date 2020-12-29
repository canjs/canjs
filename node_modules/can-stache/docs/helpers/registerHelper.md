@function can-stache.registerHelper registerHelper
@description Register a helper.
@parent can-stache/deprecated

@deprecated {4.15.0} Use [can-stache.addLiveHelper] instead.

@signature `stache.registerHelper(name, helper)`

Registers a helper function.
Pass the name of the helper followed by the
function to which stache should invoke. See [can-stache.Helpers] for more details on using helpers
and [can-stache.addHelper] to avoid converting computes;

```js
stache.registerHelper( "upper", function( str ) {
	if ( str.isComputed ) {
		str = str();
	}
	return str.toUpperCase();
} );
```

@param {String} name The name of the helper.
@param {can-stache.helper} helper The helper function.

@body
