@typedef {Object} can-connect/DataInterface DataInterface
@parent can-connect.types

@description The most common __raw__ data methods.

@signature `DataInterface`

The `DataInterface` methods are the methods most used most commonly
by `can-connect` behaviors to get or mutate information in some form of
persisted storage.  The `DataInterface` methods only operate on __raw__
data comprised of plain JavaScript Objects, Arrays and primitive types.
This is in contrast to the [can-connect/InstanceInterface] methods that
operate on typed data.

Those methods are:

- [can-connect/connection.clear] - Remove all records.
- [can-connect/connection.createData] - Create a new record.
- [can-connect/connection.destroyData] - Destroy a record.
- [can-connect/connection.getData] - Get a single record.
- [can-connect/connection.getListData] - Get multiple records.
- [can-connect/connection.getSets] - Get the [can-query-logic/query]s available within the persisted storage.
- [can-connect/connection.updateData] - Update a single record.
- [can-connect/connection.updateListData] - Update multiple records.

Behaviors either implement these methods or overwrite these methods to perform some
extra functionality.  

For example, [can-connect/data/url/url] implements these behaviors to
make an Ajax request like:

```js
connect.behavior( "data/url", function( baseConnection ) {
	return {
		getListData: function( set ) {
			return ajax( {
				type: "GET",
				url: this.url,
				data: set
			} );
		},
		getData: function() { /* ... */ }
		// ...
	};
} );
```

The [can-connect/data/parse/parse] behavior overwrites the `baseConnection`’s methods to
perform cleanup on the response data:

```js
connect.behavior( "data/parse", function( baseConnection ) {
	return {
		getListData: function( set ) {
			const self = this;
			return baseConnection.getListData( set ).then( function( response ) {
				return self.parseListData( response );
			} );
		},
		getData: function() { /* ... */ }
		// ...
	};
} );
```
