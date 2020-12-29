@module {function} can-super-model
@parent can-data-modeling
@collection can-ecosystem
@package ./package.json
@outline 2

@description Connect a type to a restful data source, automatically manage
lists, combine requests, and use a fall-through localstorage cache.

@signature `superModel(options)`

`superModel` an advanced data model that CanJS applications can
use. It requires a properly configured [can-query-logic] which experimenters might
find cumbersome to configure. If you are experimenting with CanJS, or have a
very irregular service layer, [can-rest-model] might be a better fit. If you don't need
or want caching, use [can-realtime-rest-model]. `superModel` adds the following to [can-realtime-rest-model]:

- [can-connect/fall-through-cache/fall-through-cache] - Saves all data in [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage). Uses the data
in localStorage to present data to the user immediately, but still makes the request and updates
the user presented data and localStorage data in the background.
- [can-connect/data/combine-requests/combine-requests] - Combines multiple request made at approximately the same time into a single request.   
- [can-connect/can/ref/ref] - Reference types that make relationships easier.

If your service layer matches what `superModel` expects, configuring
`superModel` is very simple.  For example,
the following defines a `Todo` and `TodoList` type and extends them
with the ability to connect to a restful service layer:

```js
import {DefineMap, DefineList, superModel} from "can";

const Todo = DefineMap.extend("Todo",{
    id: {identity: true},
    name: "string",
    complete: "boolean"
})

const TodoList = DefineList.extend("TodoList",{
    get completeCount(){
        return this.filter({complete: true}).length;
    }
})

const todoConnection = superModel({
    Map: Todo,
    List: TodoList,
    url: "/todos/{id}"
});
```

@param {Object} options Configuration options supported by all the mixed-in behaviors:

- [can-connect/can/map/map._Map] - The map type constructor function used to create
  instances of the raw record data retrieved from the server.
  The type will also be decorated
  with the following methods:
  - [can-connect/can/map/map.getList]
  - [can-connect/can/map/map.get]
  - [can-connect/can/map/map.prototype.save]
  - [can-connect/can/map/map.prototype.destroy]
  - [can-connect/can/map/map.prototype.isSaving]
  - [can-connect/can/map/map.prototype.isDestroying]
  - [can-connect/can/map/map.prototype.isNew]

- [can-connect/can/map/map._List] - The list type constructor function used to create
  a list of instances of the raw record data retrieved from the server. <span style="display:none">_</span>
- [can-connect/data/url/url.url] - Configure the URLs used to create, retrieve, update and
  delete data. It can be configured with a single url like:

  ```js
  url: "/services/todos/{_id}"
  ```

  Or an object that configures how to create, retrieve, update and delete individually:

  ```js
  url: {
    getListData: "GET /services/todos",
    getData: "GET /services/todo/{id}",
    createData: "POST /services/todo",
    updateData: "PUT /services/todo/{id}",
    destroyData: "DELETE /services/todo/{id}"
  }
  ```
- [can-connect/data/url/url.ajax] - Specify a method to use to make requests. [can-ajax] is used by default.  But jQuery's `.ajax` method can be passed.
- [can-connect/data/parse/parse.parseInstanceProp] - Specify the property to find the data that represents an instance item.
- [can-connect/data/parse/parse.parseInstanceData] - Returns the properties that should be used to
  [can-connect/constructor/constructor.hydrateInstance make an instance]
  given the results of [can-connect/connection.getData], [can-connect/connection.createData],
  [can-connect/connection.updateData],
  and [can-connect/connection.destroyData].
- [can-connect/data/parse/parse.parseListProp] Specify the property to find the list data within a `getList` response.
- [can-connect/data/parse/parse.parseListData] Return the correctly formatted data for a `getList` response.
- [can-connect/base/base.queryLogic] - Specify the identity properties of the
  type. This is built automatically from the `Map` if [can-define/map/map] is used.

@return {connection} A connection that is the combination of the options and all the behaviors
that `superModel` adds.

@signature `superModel(url)`

Create a connection with just a url. Use this if you do not need to pass in any other `options` to configure the connection.

For example, the following creates a `Todo` type with the ability to connect to a restful service layer:

```js
import {todoFixture} from "//unpkg.com/can-demo-models@5";
import {superModel} from "can";

// Creates a mock backend with 5 todos
todoFixture(5);

const Todo = superModel("/api/todos/{id}").Map;

// Prints out all todo names
Todo.getList().then(todos => {
    todos.forEach(todo => {
        console.log(todo.name);
    })
})
```
  @codepen

@param {String} url The [can-connect/data/url/url.url] used to create, retrieve, update and
  delete data.

@return {connection} A connection that is the combination of the options and all the behaviors
that `superModel` adds. The `connection` includes a `Map` property which is the type
constructor function used to create instances of the raw record data retrieved from the server.


@body
