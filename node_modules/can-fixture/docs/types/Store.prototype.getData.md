@function can-fixture/StoreType.prototype.getData getData
@parent can-fixture/StoreType.prototype

@description A [can-fixture.requestHandler requestHandler] that gets a single record from the store.

@signature `Store.getData(request, response)`

  A `requestHandler` that gets a single record from the store.

  ```js

  import {QueryLogic, fixture, ajax} from "can";
  import {Todo} from "//unpkg.com/can-demo-models@5";

  const todoStore = fixture.store( [
    {id: 1, name: "Do the dishes"},
    {id: 2, name: "Walk the dog"}
  ], new QueryLogic(Todo) );

  fixture( "GET /todos/{id}", (req, res) => {
    todoStore.getData(req, res);
  } );

  ajax( {url: "/todos/1", type: "GET"} ).then( value => {
    console.log( value ); //-> {id:1, name:"Do the dishes"}
  });

  ```
  @codepen

  @param {object} request An HTTP Request object
  @param {object} response An HTTP response object.
