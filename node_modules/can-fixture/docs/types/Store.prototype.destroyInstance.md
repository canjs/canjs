@function can-fixture/StoreType.prototype.destroyInstance destroyInstance
@parent can-fixture/StoreType.prototype

@description Destroy an instance in the fixture store programmatically.

@signature `Store.destroyInstance( param )`

  Destroy an instance in the fixture store programmatically. This is usually
  used to make sure a record exists in the store when simulating real-time services.

  ```js
  import {QueryLogic, fixture} from "can";

  const store = fixture.store([
    {id: 0, name: "foo"}
  ], new QueryLogic({identity: ["id"]}));

  // In a test, make sure the store has destroyed the same data that
  // the client is being told has been destroyed.
  store.destroyInstance( {id: 0} ).then( (record) => {
    console.log(record) //-> {id: 0, name: "foo"}
  } );
  ```
  @codepen

  @param {object} param An object containing a [can-query-logic QueryLogic] schema identity of the store.