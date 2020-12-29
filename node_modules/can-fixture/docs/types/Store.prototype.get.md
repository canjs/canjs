@function can-fixture/StoreType.prototype.get get
@parent can-fixture/StoreType.prototype

@description Returns a single record's data from the store.

@signature `Store.get( params )`

  Returns a single record's data from the store.

  ```js
  import {QueryLogic, fixture} from "can";

  const todoStore = fixture.store( [
    {id: 1, name: "Do the dishes"}, 
    {id: 2, name: "Walk the dog"}
  ], new QueryLogic({identity: ["id"]}) );

  const result = todoStore.get( {id: 1} );
  console.log( result ); //-> {id: 1, name: "Do the dishes"}

  ```
  @codepen

  @param {Object} params An object containing a [can-query-logic QueryLogic] schema identity of the store.

  @return {Object} The first record that matches the params.
