@function can-fixture.store store
@parent can-fixture.properties

@description Creates a store.

@signature `fixture.store(baseItems, queryLogic)`

  Create a store that starts with `baseItems` for a service layer
  described by `queryLogic`.

  ```js
  import {DefineMap, QueryLogic, fixture, ajax} from "can";
  import {Todo} from "https://unpkg.com/can-demo-models@5";

  // Describe the services parameters:
  const todoQueryLogic = new QueryLogic(Todo);

  // Create a store with initial data.
  // Pass an empty Array (ex: []) if you want it to be empty.
  const todoStore = fixture.store( [
    {
      id: 1,
      name: "Do the dishes",
      complete: true
    }, {
      id: 2,
      name: "Walk the dog",
      complete: false
    }
  ], todoQueryLogic );

  // Hookup urls to the store:
  fixture( "/todos/{id}", todoStore );

  ajax( {url: "/todos/1"} ).then( result => {
    console.log( result );
  } );
  ```
  @codepen
  @highlight 9-19

  @param {Array} baseItems An array of items that will populate the store.
  @param {can-query-logic} QueryLogic A description of the service layer's parameters.
  @return {can-fixture/StoreType} A store that can be used to simulate
  a restful service layer that supports filtering, pagination, and
  more.  

@signature `fixture.store(count, makeItems, queryLogic)`

  Similar to `fixture.store(baseItems, queryLogic)`, except that
  it uses `makeItems` to create `count` entries in the store.

  ```js
  import {DefineMap, QueryLogic, fixture, ajax} from "can";
  import {Todo} from "https://unpkg.com/can-demo-models@5";
  import "//unpkg.com/jquery@3.3.1/dist/jquery.js";

  // Describe the services parameters:
  const todoQueryLogic = new QueryLogic(Todo);

  // Create a store with initial data.
  const todoStore = fixture.store(
    1000,
    ( i ) => ( {
      id: i + 1,
      name: "Todo " + i,
      complete: fixture.rand( [ true, false ], 1 )[ 0 ]
    } ),
    todoQueryLogic
  );

  // Hookup urls to the store:
  fixture( "/todos/{id}", todoStore );

  ajax( {url: "/todos/3"} ).then( result => {
    console.log( result ); //-> "{'_id':3,'name':'Todo 2','complete':true||false}"
  } );

  ```
  @codepen
  @highlight 9-17

  @param {Number} count The number of `baseItems` to create.
  @param {function} makeItems A function that will generate `baseItems`
  @param {can-query-logic} queryLogic A description of the service layer's parameters.
  @return {can-fixture/StoreType} A store that can be used to simulate
  a restful service layer that supports filtering, pagination, and
  more.  
