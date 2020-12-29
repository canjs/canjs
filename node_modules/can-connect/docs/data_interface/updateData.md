@typedef {function} can-connect/connection.updateData updateData
@parent can-connect/DataInterface

@description Updates a record in the collection.

@option {function}

Updates a record given the serialized form of the data. Returns a promise
that resolves to a object that contains the new properties and values
of the record.

An example request and response might look like:

```js
connection.updateData( {
	id: 5,
	name: "do dishes",
	createdAt: 1477104548997
} ).then( function( instanceData ) {
	instanceData; //-> {
	//  id: 5,
	//  name: "do dishes",
	//  createdAt: 1477104540000,
	//  updatedAt: 1477104580000
	//}
} );
```

The following shows how [can-connect/constructor/constructor] calls `updateData`
and what it does with the response:

```js
// get its raw data
const instanceData = connection.serializeInstance( myInstance );

connection.updateData( instanceData ).then( function( updatedInstanceData ) {
	connection.updatedInstance( myInstance, updatedInstanceData );
} );
```

  @param {Object} instanceData The serialized data of the instance.

  @return {Promise<Object>} A promise resolved with the _updated_ data of the newly created instance.  

  By default, [can-connect/constructor/constructor.updatedInstance] deletes properties in `myInstance` that are not in `updatedInstanceData`.  To change that behavior, overwrite [can-connect/constructor/constructor.updatedInstance].
