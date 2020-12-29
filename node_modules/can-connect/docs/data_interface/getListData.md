@typedef {function} can-connect/connection.getListData getListData
@parent can-connect/DataInterface

@description Retrieves list of records for the given set.

@option {function}

  Returns a promise that resolves to a [can-connect.listData] for a particular set.  

  ```js
connection.getListData( { complete: true } ).then( function( listData ) {
	connection.hydrateList( listData );
} );
```

  @param {can-query-logic/query} query A object that represents the set of data needed to be loaded.  For example, `{complete: true}`
  might represent the set of all completed records.

  @return {Promise<can-connect.listData>} A promise that resolves to the [can-connect.listData] format like:

  ```js
  {
	data: [
		{ id: 1, name: "take out the trash" },
		{ id: 1, name: "do the dishes" }
	],
	count: 1000
}
```

@body

## Use

Extensions like [can-connect/data/url/url] make it easy to implement `getListData`, but it can be as simple as:

```js
const connection = connect( [], {
	getListData: function( set ) {
		return new Promise( function( resolve, reject ) {
			$.get( "/api/todos", set ).then( resolve, reject );
		} );
	}
} );
```
