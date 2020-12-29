@function can-fixture/StoreType.prototype.updateData updateData
@parent can-fixture/StoreType.prototype

@description A [can-fixture.requestHandler requestHandler] that updates a record in the store.

@signature `Store.updateData(request, response)`

  A `requestHandler` that updates an item in the store.

  ```js
  import {QueryLogic, fixture, ajax} from "can";
  import {Todo} from "https://unpkg.com/can-demo-models@5";

  const todoStore = fixture.store( [
    {id: 1, name: "Do the dishes"},
    {id: 2, name: "Walk the dog"}
  ], new QueryLogic(Todo) );

  fixture( "/todos/{id}", todoStore);
  fixture( "PUT /todos/{id}", (req, res) => {
    todoStore.updateData(req, res);
  } );

  const ajaxSettings = {
    url: "/todos/1",
    type: "PUT",
    data: {name: "test"},
  };

  ajax(ajaxSettings).then( () => {
    ajax( {url: "/todos/1", type: "GET"} ).then( value => {
      console.log(value); //-> {name:"test", id:1}
    });
  });

  ```
  @codepen

  @param {object} request An HTTP Request object
  @param {object} response An HTTP response object.
