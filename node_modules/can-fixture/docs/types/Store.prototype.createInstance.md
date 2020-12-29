@function can-fixture/StoreType.prototype.createInstance createInstance
@parent can-fixture/StoreType.prototype

@description Create an instance in the fixture store programmatically.

@signature `Store.createInstance( record )`

  Create an instance in the fixture store programmatically.  This is usually
  used to make sure a record exists when simulating real-time services.

  ```js
  import {fixture, QueryLogic} from "can";

  const store = fixture.store([
    {id: 0, name: "foo"}
  ], new QueryLogic({identity: ["id"]}));

  // In a test, make sure the store has the same data you are going
  // to "push" to the client:
  store.createInstance( {name: "lawn"} ).then( (record) => {
    console.log(record); //-> {name: "lawn", id: 1}
  } );
  ```
  @codepen

  @param {Object} record The record being added to the store.
