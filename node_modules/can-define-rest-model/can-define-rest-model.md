@module {function} can-define-rest-model
@parent can-data-modeling
@collection can-legacy
@package ./package.json
@outline 2

Connect a type to a restful service layer.

@signature `defineRestModel(options)`

`defineRestModel` extends the provided `options.Map` type
with the ability to connect to a restful service layer. For example,
the following extends a `Todo` type
with the ability to connect to a restful service layer:

```js
import {Todo, todoFixture} from "//unpkg.com/can-demo-models@5";
import {defineRestModel} from "can";

// Creates a mock backend with 5 todos
todoFixture(5);

Todo.connection = defineRestModel({
    Map: Todo,
    List: Todo.List,
    url: "/api/todos/{id}"
});

// Prints out all todo names
Todo.getList().then(todos => {
    todos.forEach(todo => {
        console.log(todo.name);
    })
})
```
  @codepen

`defineRestModel` mixes in the following behaviors:

- [can-connect/constructor/constructor]
- [can-connect/can/map/map]
- [can-connect/data/parse/parse]
- [can-connect/data/url/url]
- [can-connect/base/base]

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
  url: "/api/todos/{id}"
  ```

  Or an object that configures how to create, retrieve, update and delete individually:

  ```js
  url: {
    getListData: "GET /api/todos/find",
    getData: "GET /api/todo/get/{id}",
    createData: "POST /api/todo/create",
    updateData: "POST /api/todo/update?id={id}",
    destroyData: "POST /api/todo/delete?id={id}"
  }
  ```
- [can-connect/data/url/url.ajax] - Specify a method to use to make requests; [can-ajax] is used by default, but jQuery's `.ajax` method can be passed.
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

@return {connection} Returns a connection object.

@signature `defineRestModel(url)`

Create a connection with just a url. Use this if you do not need to pass in any other `options` to configure the connection.

For example, the following creates a `Todo` type with the ability to connect to a restful service layer:

```js
import {todoFixture} from "//unpkg.com/can-demo-models@5";
import {defineRestModel} from "can";

// Creates a mock backend with 5 todos
todoFixture(5);

const Todo = defineRestModel("/api/todos/{id}").Map;

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
that `defineRestModel` adds. The `connection` includes a `Map` property which is the type
constructor function used to create instances of the raw record data retrieved from the server.

@body

## Use

Use `defineRestModel` to build a simple connection to a restful service
layer. To use `defineRestModel`, you:

- Define data types to connect to the service layer
- Configure the connection to the service layer
- Use the types to manipulate service data

`defineRestModel` is the most
basic built-in CanJS model layer. Check out [can-define-realtime-rest-model] for models that
are able to:

- Add and remove data from lists automatically
- Unify instances across requests

### Define data types

The first step in creating a model is to define the types that will be used
to hold and manipulate data on the server.  The following defines:

- a `Todo` type to represent an individual todo's data
- ` TodoList` type to represent a list of todos

```js
import {DefineMap, DefineList, defineRestModel} from "can";

const Todo = DefineMap.extend("Todo",{
    id: {type: "number", identity: true},
    name: "string",
    complete: "boolean",
    createdAt: "date",
    toggle(){
        this.complete = !this.complete;
    }
})

Todo.List = DefineList.extend("TodoList",{
    "#": Todo,
    get completeCount(){
        return this.filter({complete: true}).length;
    }
});
```
@codepen

Notice that properties and methods are defined on the types. While any
of CanJS's map-types can be used to create a model, [can-define/map/map] currently
is the easiest to configure.

#### Nested data type or data types with relationships

Sometimes your data might include nested data and/or related data. For example, if you
get `todo` 5's data at `/api/todos/5` and it returns a nested `assignedTo` as follows:

```js
{
    id: 5,
    name: "mow lawn",
    complete: false,
    assignedTo: {
        id: 28,
        userName: "Justin Meyer"
    }
}
```

You typically want to define that nested value as another type like:

```js
const User = DefineMap.extend("User",{
    id: "number",
    userName: "string"
});

const Todo = DefineMap.extend("Todo",{
    id: {type: "number", identity: true},
    name: "string",
    complete: "boolean",
    assignedTo: User,
    toggle(){
        this.complete = !this.complete;
    }
});
```

Check out the [can-connect/can/ref/ref] behavior for additional relationship features.

If you are using [can-define/map/map] and your server might add properties that can't be defined
beforehand, make sure to unseal your todo type:

```js
const Todo = DefineMap.extend("Todo",
{   
    seal: false
},
{
    id: {type: "number", identity: true},
    name: "string",
    complete: "boolean",
    toggle(){
        this.complete = !this.complete;
    }
});
```

Often with document-based data structures, it's nice to have a reference to the "root"
data object on all child objects.  For example, `todo` data might have a list of subtasks, each
with their own name and complete status:

```js
{
    id: 5,
    name: "mow lawn",
    complete: false,
    subtasks: [
        {name: "get gas", complete: true},
        {name: "sharpen blades", complete: false}
    ]
}
```

It can be nice to have the individual subtasks have a reference to their parent `todo`. For example, this
makes updating the subtask easier.  The following makes it so calling a `subtask`'s `.save()` actually
calls it's `todo`'s `.save()` method:

```js
import {DefineMap, DefineList, defineRestModel} from "//unpkg.com/can@5/core.mjs";
import {todoFixture} from "//unpkg.com/can-demo-models@5";

// Model subtask
const Subtask = DefineMap.extend("Subtask",{
    name: "string",
    complete: "boolean",
    // parentTodo should not be serialized
    parentTodo: {serialize: false, type: "any"},
    // a save utility that actually saves the parent todo
    save(){
        this.parentTodo.save();
    }
});

// Model a list of subtasks to add the `parentTodo` to all subtasks
Subtask.List = DefineList.extend("Subtasks",{
    // Defines the items in the subtasks list
    "#": {
        Type: Subtask,
        // If subtasks are added, set their parentTodo
        added(subtasks){
            if(this.parentTodo) {
                subtasks.forEach((subtask) => {
                    subtask.parentTodo = this.parentTodo;
                })
            }
            return subtasks;
        },
        // If subtasks are removed, remove their parentTodo
        removed(subtasks) {
            subtasks.forEach((subtask) => {
                subtask.parentTodo = null;
            })
        }
    },
    // If parentTodo is set, update all the subtasks' parentTodo
    parentTodo: {
        set(parentTodo){
            this.forEach(function(subtask){
                subtask.parentTodo = parentTodo;
            });
            return parentTodo;
        },
        serialize: false
    }
});

const Todo = DefineMap.extend("Todo",{
    id: {type: "number", identity: true},
    name: "string",
    complete: "boolean",
    // Make it so when subtasks is set, it sets
    // the parentTodo reference:
    subtasks: {
        Type: Subtask.List,
        set(subtasks){
            subtasks.parentTodo = this;
            return subtasks;
        }
    },
    toggle(){
        this.complete = !this.complete;
    }
});

Todo.List = DefineList.extend("TodoList",{
    "#": Todo,
});

// Sets up a can-fixture as the backend
todoFixture(0);

// Creates a defineRestModel
Todo.connection = defineRestModel({
    Map: Todo,
    List: Todo.List,
    url: "/api/todos/{id}"
});

// Creates a new todo with one subtask
let myTodo = new Todo({
    name: "learn canjs", completed: false,
    subtasks: [{name: "learn js", completed: false}]
});

// Modifies and saves the subtask (thus saving the entire todo)
myTodo.subtasks[0].completed = true;
myTodo.subtasks[0].save();

// Reads the newly saved todo from the backend and prints it's completed status
Todo.getList().then(todos => console.log(todos[0].subtasks[0].completed));
```
  @highlight 10-12
  @codepen


#### The identity property

If you're specifying the identity property on nested data types, `defineRestModel` will be able to
intelligently merge data.  For example, say a `Todo` and its nested `User` type are defined as follows:

```js
const User = DefineMap.extend("User",{
    id: "number",
    name: "string"
});

const Todo = DefineMap.extend("Todo",{
    id: {type: "number", identity: true},
    name: "string",
    complete: "boolean",
    assignedTo: [User]
});
```

If a todo like the following:

```js
let justin = new User({id: 20, name: "Justin"}),
    ramiya = new User({id: 21, name: "Ramiya"});

let todo = new Todo({
    id: 1,
    name: "mow lawn",
    complete: false,
    assignedTo: [justin, ramiya]
});
```

is updated with data like:

```js
{
    id: 1,
    name: "mow lawn",
    complete: true,
    assignedTo: [{
        id: 21, name: "Ramiya Meyer"
    }]
}
```

__Without__ specifying the identity property of `User`, the `justin` instance's `id` and `name` will be updated, __not__ the `ramiya` instance's like you might expect:

```js
justin.id //-> 21
justin.name //-> "Ramiya Meyer"
```

However, if the `User` object's `id` property is specified with an `identity: true` flag as follows:

```js
const User = DefineMap.extend("User",{
    id: {type: "number", identity: true},
    name: "string"
});
```
@highlight 2

When the update happens, the `ramiya` instance will be updated correctly:

```js
ramiya.id //-> 21
ramiya.name //-> "Ramiya Meyer"
```


### Configure the connection

Once you have your types defined, the next step is to configure
your connection to make requests to your service layer and create
these types.

If your service layer matches what CanJS expects, this configuration
might be as simple as the following:

```js
Todo.connection = defineRestModel({
    Map: Todo,
    List: Todo.List,
    url: "/api/todos/{id}"
});
```

This configuration assumes the following:

 - `GET /api/todos` is used to retrieve a list of todos. It returns a JSON response like:
   ```js
   {
       data: [
           { id: 5, name: "mow lawn", complete: false },
           ...
       ],
       totalCount: 20
   }
   ```
   Note that an object is returned with a `data` array. The array contains the data
   that will be used to create instances of the `Todo` type. Other properties on the object
   (ex: `totalCount`) will be added to the list type. The data above produces:

   ```js
   todos instanceof Todo.List //-> true
   todos.totalCount          //-> 20
   todos[0] instanceof Todo  //-> true
   todos[0].id               //-> 5
   ```
- `GET /api/todos/5` is used to retrieve a single todo. It returns a JSON response like:
   ```js
   { id: 5, name: "mow lawn", complete: false }
   ```
   Note that the object returned contains the values that will be used to create a `Todo` instance.
- `POST /api/todos` is used to create a single todo record. It should take a JSON request body of
  the properties on a todo record like:
  ```js
  { name: "do dishes", complete: false }
  ```
  The server should return a JSON response with the identity properties and any other values that
  should be included on the object:
  ```js
  { id: 6, name: "do dishes", complete: false, createdAt: "2018-04-18" }
  ```
- `PUT /api/todos/6` is used to update a todo record. It should take a `JSON` request body of
  the properties of the todo record (with the exception of the identity keys) like:
  ```js
  { name: "do dishes", complete: true, createdAt: "2018-04-18" }
  ```
  The server should return a JSON response with the full record:
  ```js
  { id: 6, name: "do dishes", complete: true, createdAt: "2018-04-18" }
  ```
- `DELETE /api/todos/6` is used to delete a todo record. The server should return the record data:
  ```js
  { id: 6, name: "do dishes", complete: true, createdAt: "2018-04-18" }
  ```
  or an empty successful response.


If your service layer doesn't match what CanJS expects, then you can configure
either how the request is made or how the response is parsed.

The `url` option can be configured with individual urls used to create, retrieve, update
and delete data:

```js
Todo.connection = defineRestModel({
    Map: Todo,
    List: Todo.List,
    url: {
        getListData: "GET /api/todos/find",
        getData: "GET /api/todo/get/{id}",
        createData: "POST /api/todo/create",
        updateData: "POST /api/todo/update?id={id}",
        destroyData: "POST /api/todo/delete?id={id}"
    }
});
```

You can also supply functions to retrieve the data yourself and return a promise that
resolves to the expected data format.  The following makes `getListData` use
`fetch` to request JSON data:

```js
import { param, defineRestModel } from "can";

Todo.connection = defineRestModel({
    Map: Todo,
    List: Todo.List,
    url: {
        getListData: function(query) {
            return fetch("/api/todos/find?"+param(query)).then(function(response){
                return response.json();
            })
        },
        getData: "GET /api/todo/get/{id}",
        createData: "POST /api/todo/create",
        updateData: "POST /api/todo/update?id={id}",
        destroyData: "POST /api/todo/delete?id={id}"
    }
});
```

If the response data doesn't match the expected format, you can either fix it in
functions like `getListData` above or use
[can-connect/data/parse/parse.parseInstanceProp], [can-connect/data/parse/parse.parseListProp],
[can-connect/data/parse/parse.parseInstanceData] or [can-connect/data/parse/parse.parseListData]
to fix the formatting.  For example, if `GET /api/todos` returned data like:

```js
{
    todos: [
        { id: 5, name: "mow lawn", complete: false },
        ...
    ],
    totalCount: 20
}
```

You could correct this with [can-connect/data/parse/parse.parseListProp] like:

```js
Todo.connection = defineRestModel({
    Map: Todo,
    List: Todo.List,
    url: "/api/todos/{id}",
    parseListProp: "todos"
});
```



### Manipulate service data

The below code allows one to retrieve, create, update, and destroy instances using
methods on `Todo` and instances of `Todo`:

```js
import {Todo, todoFixture} from "//unpkg.com/can-demo-models@5";
import {defineRestModel} from "can";

// Creates a mock backend with 5 todos
todoFixture(5);

Todo.connection = defineRestModel({
    Map: Todo,
    List: Todo.List,
    url: "/api/todos/{id}"
});

// get a list of todos
Todo.getList({filter: {complete: true}}) //-> Promise<Todo.List>

// get a single todo
Todo.get({id: 4}) //-> Promise<Todo>

// create a todo and persist it to the server:
let todo = new Todo({name: "learn canjs", complete: false})
todo.save() //-> Promise<Todo>

// update the todo and persist changes to the server:
todo.complete = true;
todo.save() //-> Promise<Todo>

// prints out all complete todos including the new one
Todo.getList({filter: {complete: true}})
  .then(todos => todos.forEach(todo => console.log(todo.name)))

// delete the todo on the server
todo.destroy() //-> Promise<Todo>
```
@codepen

`defineRestModel` also mixes in methods that let you know if the
object is being saved, destroyed, or has already been created:

- [can-connect/can/map/map.prototype.isSaving]
- [can-connect/can/map/map.prototype.isDestroying]
- [can-connect/can/map/map.prototype.isNew]

```js
todo.isSaving() //-> Boolean

todo.isDestroying() //-> Boolean

todo.isNew() //-> Boolean
```

These methods are observable, so they can be read in a template and the template will automatically
update:

```js
<button disabled:from="todo.isSaving()">Update</button>
```

`defineRestModel` also makes the type and instances of the type emit events when items
are created, updated or destroyed:

```js
Todo.on("created", function(ev, newTodo) {
    console.log("Todo created event");
});

let todo = new Todo({name: "mow lawn"});
todo.on("created", function(){
    console.log("todo created event");
})

todo.save()
    //-> logs "todo created event"
    //   logs "Todo created event"
```
