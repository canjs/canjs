@typedef {function} can-connect/connection.clear clear
@parent can-connect/DataInterface

@description Deletes all records on a connection.

@option {function}

Deletes all records on a connection.

  @return {Promise} Returns a promise that resolves when all data is cleared.

@body

## Use

Implement `clear` to remove all data in a connection.

```js
connect.behavior( "my-behavior", function( baseConnection ) {
	return {
		clear: function() {

			// delete tabs, or clear localStorage, etc
		}
	};
} );
```
