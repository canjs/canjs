@function can-connect/connection.destroy destroy
@parent can-connect/InstanceInterface

Destroy an instance.

@signature `connection.destroy( instance )`

Destroys an instance using the `connection` by calling
[can-connect/connection.destroyData].

```js
// get an instance
connection.get( { id: 5 } ).then( function( instance ) {

	// destroy it
	connection.destroy( instance );
} );
```

Note that [can-connect/can/map/map] adds `destroy` to the `instance`
type's prototype.

@param {can-connect/Instance} instance A typed instance.

@return {Promise<can-connect/Instance>} Returns a promise that
resolve with destroyed instance if [can-connect/connection.destroyData] is resolved.  The promise is rejected if [can-connect/connection.destroyData] is rejected.
