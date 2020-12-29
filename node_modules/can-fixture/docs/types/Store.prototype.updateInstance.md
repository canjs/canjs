@function can-fixture/StoreType.prototype.updateInstance updateInstance
@parent can-fixture/StoreType.prototype

@description Destroy an instance in the fixture store programmatically.

@signature `Store.updateInstance( params )`

  Update an instance in the fixture store programmatically.

  ```js
  import {QueryLogic, fixture} from "can";

  const store = fixture.store([
    {id: 0, name: "dishes"}
  ], new QueryLogic({identity: ["id"]}));

  // In a test, make sure the store has updated the same data that
  // the client is being told has been updated.
  store.updateInstance( {id: 0, name: "do the dishes"} ).then(record => {
    console.log( record ); //-> {id: 0, name: "do the dishes"}
  });
  ```
  @codepen

  @param {Object} params A matching identity and properties to be updated.
