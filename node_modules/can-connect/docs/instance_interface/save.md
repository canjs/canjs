@function can-connect/connection.save save
@parent can-connect/InstanceInterface

Create or update an instance.

@signature `connection.save( instance )`

Creates or updates an instance using the `connection` by calling
[can-connect/connection.createData] or [can-connect/connection.updateData].

```js
// create an instance
const instance = new Type();

// create it with the connection
connection.save( instance ).then( function( instance ) {

	// change the instance
	instance.prop = "NEW VALUE";

	// update it with the connection
	connection.save( instance ).then( function( instance ) {

	} );

} );
```

The choice of [can-connect/connection.createData] or [can-connect/connection.updateData] is made by the result of
[can-connect/constructor/constructor.isNew].



Note that [can-connect/can/map/map] adds `save` to the `instance`
type's prototype.

@param {can-connect/Instance} instance A typed instance.

@return {Promise<can-connect/Instance>} Returns a promise that
resolve with created or updated instance if [can-connect/connection.createData] or [can-connect/connection.updateData] is resolved.  The promise is rejected if [can-connect/connection.createData] or [can-connect/connection.updateData] is rejected.
