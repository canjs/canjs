@function can-fixture/StoreType.prototype.createData createData
@parent can-fixture/StoreType.prototype

@description Creates records in the store. It can serve as a [can-fixture.requestHandler requestHandler].

@signature `Store.createData(request, response)`

  Creates records in the store. It can serve as a `requestHandler`. The example will store the the object in the data parameter in the store.

  ```js
  import {QueryLogic, fixture, ajax} from "can";

  const todoStore = fixture.store(
    [],
    new QueryLogic({ identity: ["id"] })
  );

  fixture( "POST /todos", (req, res) => {
    todoStore.createData(req, res);
  } );

  const ajaxSettings = {
    url: "/todos",
    type: "POST",
    data: {name:"Write examples!"}
  };

  ajax(ajaxSettings).then(result => {
    console.log(result); //-> {id: 1, name: "Write examples!"}
  });

  ```
  @codepen
  
  @param {object} request An HTTP Request object
  @param {object} response An HTTP response object.
  