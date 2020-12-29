@typedef {Object<String,can-set-legacy.prop>} can-set-legacy.compares Compares
@parent can-set-legacy.types

@description An object of property names and `prop` functions.

@type {Object<String,can-set-legacy.prop>}

```js
{

	// return `true` if the values should be considered the same:
	lastName: function( aValue, bValue ) {
		return ( "" + aValue ).toLowerCase() === ( "" + bValue ).toLowerCase();
	}
}
```


@option {Object<String,can-set-legacy.prop>}
