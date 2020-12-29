@typedef {function} can-connect/connection.getSets getSets
@parent can-connect/DataInterface

@description Gets the sets that are available in the connection.

@option {function}

  Returns a promise that resolves to a list of [can-query-logic/query] objects contained in the
  connection.  This is useful for querying a [can-connect/base/base.cacheConnection]
  if it will be able to satisfy a request.

  An example response might look like:

  ```js
connection.getSets().then( function( sets ) {
	sets; //-> [
	//   {complete: true},
	//   {userId: 5, start: 10, end: 20}
	//]
} );
```

  @return {Promise<Array<can-query-logic/query>>} A promise that resolves to an an array of sets.

@body

## Use

Extensions like [can-connect/data/localstorage-cache/localstorage-cache] implement
`.getSets` to provide the sets they contain.
