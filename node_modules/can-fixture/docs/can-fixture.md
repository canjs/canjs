@module {function} can-fixture
@parent can-data-modeling
@collection can-core
@group can-fixture.properties properties
@group can-fixture.types types
@package ../package.json

@description Intercept AJAX requests and simulate the response.

@signature `fixture(ajaxSettings, requestHandler(...))`

  If an XHR request matches ajaxSettings, calls requestHandler with the XHR requests data. Makes the XHR request respond with the return value of requestHandler or the result of calling its response argument.

  When adding a fixture, it will remove any identical fixtures from the list of fixtures. The last fixture added will be the first matched.

  The following traps requests to GET /todos and responds with an array of data:

  ```js
  import {fixture, ajax} from "can";

  fixture( { method: "get", url: "/todos" },
    ( request, response, headers, ajaxSettings ) => {
      return {
        data: [
          { id: 1, name: "dishes" },
          { id: 2, name: "mow" }
        ]
      };
    }
  );

  ajax( {url: "/todos"} ).then( result => {
    console.log( result.data ); //-> [{id: 1, name: "dishes"}, {id:2, name: "mow"}]
  } );

  ```
  @codepen

  Return a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) (or use [async](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) & [await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await)) from `requestHandler` to asynchronously return results. This allows fixtures to depend on each other, introduce dynamic delays, and even depend on external resources.

  ```js
  import {fixture, ajax} from "can";

  fixture( { method: "get", url: "/todos" },
    ( request, response, headers, ajaxSettings ) => {
      return new Promise((resolve) => {
        setTimeout(() => resolve({
          data: [
            { id: 1, name: "dishes" },
            { id: 2, name: "mow" }
          ]
        }), 1000);
	  });
    }
  );

  // or

  fixture( { method: "get", url: "/todos" },
    async ( request, response, headers, ajaxSettings ) => {
      await delay(1000);
      return {
        data: [
          { id: 1, name: "dishes" },
          { id: 2, name: "mow" }
        ]
      };
    });
  );

  ajax( {url: "/todos"} ).then( result => {
    console.log( result.data ); //-> [{id: 1, name: "dishes"}, {id:2, name: "mow"}]
  } );

  ```
  @codepen

  @param {can-fixture/types/ajaxSettings} ajaxSettings An object that is used to match values on an XHR object, namely the url and method. url can be templated like `/todos/{_id}`.
  @param {can-fixture.requestHandler} requestHandler Handles the request and provides a response.
  @return {Array<can-fixture/types/ajaxSettings>}  Returns an array of any fixtures that are replaced by the fixture that is added.

@signature `fixture( ajaxSettings, url )`

  Redirects the request to another url.  This can be useful for simulating a response with a file.

  ```js
  import {fixture, ajax} from "can";

  fixture( { url: "/tasks" }, "/fixtures/tasks.json" );

  ajax( {url: "/tasks"} ); // "can-fixture: /tasks => /fixtures/tasks.json"

  ```
  @codepen
  @highlight 3

  Placeholders available in the `ajaxSettings` url will be available in the redirect url:

  ```js
  import {fixture, ajax} from "can";

  fixture( {url: "/tasks/{id}"}, "fixtures/tasks/{id}.json" );

  ajax( {url: "/tasks/1"} ); // "can-fixture: /tasks/1 => /fixtures/tasks/1.json"
  ```
  @codepen
  @highlight 3

  @param {can-fixture/types/ajaxSettings} ajaxSettings An object that is used to match values on an XHR object, namely the url and method. url can be templated like `/tasks/{_id}`.
  @param {String} url The pathname of requests that will be trapped.

@signature `fixture( ajaxSettings, data )`

  Responds with the result of `data`.

  ```js
  import {fixture, ajax} from "can";

  fixture( {url: "/tasks"}, {tasks: [ {id: 1, complete: false} ]} );

  ajax( {url: "/tasks"} ).then( result => {
    console.log( result ); //-> {tasks:[{id:1, complete:false}]}
  } );

  ```
  @codepen
  @highlight 3

  @param {can-fixture/types/ajaxSettings} ajaxSettings An object that is used to match values on an XHR object, namely the url and method.
  @param {Object} data A representation of records in the store.
  @return {Array<can-fixture/types/ajaxSettings>}  Returns an array of any fixtures that are replaced by the fixture that is added.

@signature `fixture(ajaxSettings, delay)`

  Delays the ajax request from being made for `delay` milliseconds. See [can-fixture.delay delay] for more information.

  ```js
  import {fixture, ajax} from "can";

  fixture( { url: "/tasks" }, 2000 );

  ajax( {url: "/tasks"} ); // "can-fixture: /tasks => delay 2000ms"

  ```
  @codepen
  @highlight 3

  This doesn't simulate a response, but is useful for simulating slow connections.

  @param {can-fixture/types/ajaxSettings} ajaxSettings An object that is used to match values on an XHR object, namely the url and method. url can be templated like `/todos/{_id}`.
  @param {Number} delay A numeric representation of milliseconds that the response should wait.
  @return {Array<can-fixture/types/ajaxSettings>}  Returns an array of any fixtures that are replaced by the fixture that is added.

@signature `fixture(ajaxSettings, null)`

  Removes the matching fixture from the list of fixtures. See [can-fixture.on on] for related.

  ```js
  import {fixture, ajax} from "can";

  fixture( {url: "/tasks"}, "fixtures/tasks.json" );

  ajax( {url: "/tasks"} ); // requests fixtures/tasks.json

  fixture( {url: "/tasks"}, null );

  // Made a request to "/tasks", but we catch a 404.
  ajax( {url: "/tasks"} ).catch( error => {
    console.log("error"); //-> "error"
  });

  ```
  @codepen

  @param {can-fixture/types/ajaxSettings} ajaxSettings An object that is used to match values on an XHR object, namely the url and method. url can be templated like `/todos/{_id}`.
  @param {object} null A representation of the intentional absence of any object value. [null](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/null) is a JavaScript primitive value.
  @return {Array<can-fixture/types/ajaxSettings>}  Returns an array of any fixtures that are replaced by the fixture that is added.

@signature `fixture( methodAndUrl, url|data|requestHandler )`

  A short hand for creating an [can-fixture/types/ajaxSettings] with a `method` and `url`.

  ```js
  fixture( "GET /tasks", requestHandler );

  // is the same as

  fixture( { method: "get", url: "/tasks" }, requestHandler );
  ```

  @param {Object} methodAndUrl A string formatted like is `METHOD URL`.
  @param {String|Object|can-fixture.requestHandler} url|data|requestHandler The URL that will be queried. A representation of records in the store. A definition for XHR response for a given trapped request.
  @return {Array<can-fixture/types/ajaxSettings>}  Returns an array of any fixtures that are replaced by the fixture that is added.

@signature `fixture( url, url|data|requestHandler )`

  A short hand for creating an [can-fixture/types/ajaxSettings] with just a `url`.

  ```js
  fixture( "/tasks", requestHandler );

  // is the same as

  fixture( { url: "/tasks" }, requestHandler );
  ```
  @param {String} url The pathname of requests that will be trapped.
  @param {String|Object|can-fixture.requestHandler} url|data|requestHandler The URL that will be queried. A representation of records in the store. A definition for XHR response for a given trapped request.
  @return {Array<can-fixture/types/ajaxSettings>}  Returns an array of any fixtures that are replaced by the fixture that is added.

@signature `fixture( fixtures )`

  Create multiple fixtures at once.

  ```js
  import {fixture, ajax} from "can";

  fixture( {
    "POST /tasks": () => {
      return { id: parseInt(Math.random() * 10, 10) };
    },
    "GET /tasks": { data: [ {id: 1, name: "mow lawn"} ] },
    "/people": "fixtures/people.json"
  } );

  ajax( {type: "POST", url:"/tasks"} ).then( result => {
    console.log( result ); //-> {id: RandomNumber}
  } );

  ajax( {url: "/tasks"} ).then( result => {
    console.log( result.data ); //-> [ {id: 1, name: "mow lawn"} ]
  } );
  ```
  @codepen

  @param {Object<methodAndUrl,String|Object|can-fixture.requestHandler|can-fixture/StoreType>} fixtures A mapping of methodAndUrl to some response argument type.
  @return {Array<can-fixture/types/ajaxSettings>}  Returns an array of any fixtures that are replaced by the fixture that is added.

@signature `fixture( restfulUrl, store )`

  Wire up a restful API scheme to a store.

  ```js
  import {QueryLogic, fixture, ajax} from "can";

  const todoStore = fixture.store( [
    { id: 1, name: "Do the dishes" },
    { id: 2, name: "Walk the dog" }
  ], new QueryLogic( {identity: ["id"]} ) );

  // can also be written fixture("/api/todos", todoStore);
  fixture( "/api/todos/{id}", todoStore );

  ajax( {url:"/api/todos/1"} ).then( result => {
    console.log( result ); //-> "{'id':1,'name':'Do the dishes'}"
  } );
  ```
  @codepen

  This is a shorthand for wiring up the `todoStore` as follows:

  ```js
  import {QueryLogic, fixture, ajax} from "can";

  const todoStore = fixture.store( [
    { id: 1, name: "Do the dishes" },
    { id: 2, name: "Walk the dog" }
  ], new QueryLogic( {identity: ["id"]} ) );

  fixture( {
    "GET /api/todos": todoStore.getListData,
    "GET /api/todos/{id}": todoStore.getData,
    "POST /api/todos": todoStore.createData,
    "PUT /api/todos/{id}": todoStore.updateData,
    "DELETE /api/todos/{id}": todoStore.destroyData
  } );

  ajax( {url: "/api/todos/1"} ).then( result => {
    console.log( result ); //-> "{'id':1,'name':'Do the dishes'}"
  } );
  ```
  @codepen
  @highlight 8-14,only

  @param {String} restfulUrl The url that may include a template for the place of the ID prop.  The `list` url is assumed to be `restfulUrl` with the `/{ID_PROP}` part removed, if provided; otherwise the `item` url is assumed to have the `/{ID_PROP}` part appended to the end.
  @param {can-fixture/StoreType} store A store produced by [can-fixture.store].
  @return {Array<can-fixture/types/ajaxSettings>}  Returns an array of any fixtures that are replaced by the fixture that is added.

@signature `fixture(ajaxSettingsArray)`

  Add fixtures that have been previously removed with another call to fixture.

  @param {Array<can-fixture/types/ajaxSettings>}  An array of AJAX settings objects
  @return {Array<can-fixture/types/ajaxSettings>} Returns an array of any fixtures that are replaced by the fixtures that are added.
