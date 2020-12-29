@typedef {function} can-connect/connection.destroyData destroyData
@parent can-connect/DataInterface

@description Destroys a record in the collection.

@option {function}

Destroys an instance given the serialized form of the
data. Returns any additional properties that should be added to the instance.

The following shows how [can-connect/constructor/constructor] calls `destroyData` and
what it does with the response:

```js
// get its raw data
const instanceData = connection.serializeInstance( myInstance );

connection.destroyData( instanceData ).then( function( destroyedInstanceData ) {
	connection.destroyedInstance( myInstance, createdInstanceData );
} );
```

  @param {Object} instanceData The serialized data of the instance.

  @return {Promise<Object>} A promise resolved with the _destroyed_ data of the instance. The _destroyed_
  data.  

  By default, [can-connect/constructor/constructor.destroyedInstance] deletes properties in `myInstance` that are not in `destroyedInstanceData`.  To change that behavior, overwrite [can-connect/constructor/constructor.destroyedInstance].
