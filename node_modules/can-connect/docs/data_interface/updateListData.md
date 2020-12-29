@typedef {function} can-connect/connection.updateListData updateListData
@parent can-connect/DataInterface

@description Updates records for a particular set in the connection.

@option {function}

  Returns a promise that resolves to the list data for a particular set.

  ```js
connection.updateListData( {
	data: [
		{ id: 1, name: "dishes", createdAt: 1477104548997 }
	]
}, {} ).then( function( listData ) {
	listData; //-> {
	//    data: [
	//      {id: 1, name: "dishes",
	//       createdAt: 1477104548997, updatedAt: 1477104580000}
	//    ]
	//}
} );
```

  @param {can-connect.listData} listData A object that represents the set of data needed to be loaded.

  @param {Object} [set] The set of data that is updating.

  @return {Promise<can-connect.listData>} A promise that resolves to the updated [can-connect.listData].

@body
