@function can-connect/connection.getList getList
@parent can-connect/InstanceInterface

Gets a [can-connect.List] of instances.

@signature `connection.getList( set )`

Gets a [can-connect.List] of instances using the `connection` by calling
[can-connect/connection.getListData].

```js
connection.getList( { parentId: 5 } ).then( function( list ) {

} );
```

Note that [can-connect/can/map/map] adds `getList` to the `instance`'s
constructor function.


  @param {can-query-logic/query} query A set object that represents the list of data to load.

  @return {Promise<can-connect.List>} Returns a promise that
  resolve with a `List` if [can-connect/connection.getListData] is resolved.  The promise is rejected if [can-connect/connection.getListData] is rejected.
