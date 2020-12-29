@function can-connect/connection.get get
@parent can-connect/InstanceInterface


Gets a [can-connect/Instance].

@signature `connection.get( params )`

Get a single [can-connect/Instance] using the `connection` by calling
[can-connect/connection.getData].

```js
connection.get( { id: 5 } ).then( function( instance ) {

} );
```

Note that [can-connect/can/map/map] adds `get` to the `instance`'s
constructor function.


  @param {Object} params An object that specifies an instance to retrieve.  Typically, the object contains the `id` property and the `id` value of the
  instance that should be retrieved like `{_id: "saq232la8kjsa"}`.

  @return {Promise<can-connect.List>} Returns a promise that
  resolve with a `List` if [can-connect/connection.getData] is resolved.  The promise is rejected if [can-connect/connection.getData] is rejected.
