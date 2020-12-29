@typedef {function} can-connect/connection.getData getData
@parent can-connect/DataInterface
@description Retrieves a record.

@option {function}

  Returns a promise that resolves to the instance data for particular parameters.

  The following shows how [can-connect/constructor/constructor] calls `getData`
  and what it does with the response:

  ```js
connection.getData( { id: 1 } ).then( function( instanceData ) {
	connection.hydrateInstance( instanceData );
} );
```

  @param {Object} params A object that represents the set of data needed to be loaded.

  @return {Promise<Object>} A promise that resolves to the properties of a record.

@body

## Use

Extensions like [can-connect/data/url/url] implement `getData`  but implementing it yourself can be as simple as:

```js
const behavior = connect( [], {
	getData: function( params ) {
		return new Promise( function( resolve, reject ) {
			$.get( "/api/todo", params ).then( resolve, reject );
		} );
	}
} );
```
