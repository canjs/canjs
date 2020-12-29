@typedef {function} can-connect/connection.createData createData
@parent can-connect/DataInterface

@description Creates a new record in the connection.

@option {function}

Creates a new record given the serialized form of the data. Resolves to a promise with any additional
properties that should be added to the
instance. A [can-cid client ID] is passed of the instance that is
being created.

The following shows how [can-connect/constructor/constructor] calls `createData`
and what it does with the response:

```js
import CID from "can-cid";

// Create an instance of a special type
const myInstance = new MyType( { /* ... */ } );

// get its CID
const cid = CID( myInstance );

// get its raw data
const instanceData = connection.serializeInstance( myInstance );

connection.createData( instanceData, cid ).then( function( createdInstanceData ) {
	connection.createdInstance( myInstance, createdInstanceData );
} );
```


  @param {Object} instanceData The serialized data of the instance.

  @param {Number} [cid] A unique id that represents the instance that is being created.  Given this value,
  the instance can be retrieved in the [can-connect/constructor/constructor.cidStore].

  @return {Promise<Object>} A promise resolved with the _created_ data of the newly created instance. The _created_
  data __must__ have the [can-connect/base/base.id] of the created record.  

  By default, [can-connect/constructor/constructor.createdInstance] only adds the data in `createdInstanceData` to
  `myInstance`, it does not remove it.  To remove "missing" properties on `myInstance` that are not in `createdInstanceData`, overwrite
  [can-connect/constructor/constructor.createdInstance].
