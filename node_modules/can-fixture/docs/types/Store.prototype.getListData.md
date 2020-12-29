@function can-fixture/StoreType.prototype.getListData getListData
@parent can-fixture/StoreType.prototype

@description A `requestHandler` that gets multiple items from the store.

@signature `Store.getListData(request, response)`

  A `requestHandler` that gets multiple items from the store.

  ```js
  import {QueryLogic, fixture, ajax} from "can";

  const todoStore = fixture.store( [
    {id: 1, name: "Do the dishes", complete: true},
    {id: 2, name: "Walk the dog", complete: true},
    {id: 3, name: "Write docs", complete: false}
  ], new QueryLogic() );

  fixture( "GET /todos", (req, res) => {
    todoStore.getListData(req, res);
  } );

  const ajaxOptions = {
    url: "/todos",
    data: { filter: {complete: true} }
  }

  ajax( ajaxOptions ).then( value => {
    console.log( value.data ); //-> [
    //   {id:1, name:"Do the dishes", complete: true},
    //   {id:2, name:"Walk the dog", complete: true} 
    // ]
  });

  ```
  @codepen

  @param {object} request An HTTP Request object
  @param {object} response An HTTP response object.