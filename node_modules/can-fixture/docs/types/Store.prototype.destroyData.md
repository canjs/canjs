@function can-fixture/StoreType.prototype.destroyData destroyData
@parent can-fixture/StoreType.prototype

@description A [can-fixture.requestHandler requestHandler] that removes a record from the store.

@signature `Store.destroyData(request, response)`

  A `requestHandler` that removes a record from the store.

  ```js
  import {QueryLogic, fixture, ajax} from "//unpkg.com/can@5/core.mjs";
  import {Todo} from "https://unpkg.com/can-demo-models@5";

  const todoStore = fixture.store( [
    {id: 1, name: "Do the dishes"},
    {id: 2, name: "Walk the dog"}
  ], new QueryLogic(Todo) );

  fixture("/todos", todoStore)

  fixture( "DELETE /todos/{id}", (req, res) => {
    todoStore.destroyData(req, res);
  } );

  ajax( {url: "/todos/1", type: "DELETE"} ).then( result => {
    console.log(result); //-> {id: 1, name: "Do the dishes"}
  } );

  ajax( {type: "GET", url: "/todos"} ).then( value => {
    console.log( value.data ); //-> [ {id: 2, name: "Walk the dog"} ]
  } );

  ```
  @codepen

  @param {object} request An HTTP Request object
  @param {object} response An HTTP response object.