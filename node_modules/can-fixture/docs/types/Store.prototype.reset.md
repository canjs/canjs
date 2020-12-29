@function can-fixture/StoreType.prototype.reset reset
@parent can-fixture/StoreType.prototype

@description Sets the items in the store to their original state.

@signature `Store.reset( [baseItems] )`

  Sets the items in the store to their original state or to `baseItems` if it's passed as an argument.

  ```js
  import {QueryLogic, fixture, ajax} from "can";

  // Creates a store with one item.
  const todoStore = fixture.store(
    [ {id: 1, name: "dishes"} ],
    new QueryLogic({identity: ["id"]})
  );

  fixture( "/todos/{id}", todoStore );

  console.log( todoStore.getList( {} ).count ); //-> 1

  // delete that item
  ajax( { url: "/todos/1", type: "DELETE" } )
    .then( () => {
      console.log( todoStore.getList( {} ).count ); //-> 0
    } )
    .then( () => {
      // calling reset adds it back
      todoStore.reset();
      console.log( todoStore.getList( {} ).count ); //-> 1
    } );
  ```
  @codepen

  @param {Array} baseItems If provided, adds these items to the store.  
  This can be useful for setting up particular testing scenarios.
