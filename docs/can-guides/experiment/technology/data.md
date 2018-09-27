@page guides/data Service Layer
@parent guides/essentials 4
@outline 2

@description Learn how to get, create, update, and delete backend service layer data.

@body

<style>
table.panels .background td {
    background: #f4f4f4;
    padding: 5px 5px 5px 5px;
    border: solid 1px white;
    margin: 1px;
    vertical-align: top;
}
table.panels pre {
    margin-top: 0px;
}
</style>

## Overview

Most applications need to request data from a server.  For example, you might have used
[XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) to
make an __AJAX__ request, used the new [fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
to get JSON data, or used [jQuery.ajax](http://api.jquery.com/jquery.ajax/) to post form data.

While these techniques are _fine_ in a CanJS application, using CanJS’s service-layer modeling tools can solve some difficult problems with little configuration:

- Provide a standard interface for retrieving, creating, updating, and deleting data.
- Convert raw data from the server to typed data, with methods and special property behaviors.
- Caching
- Real time updates of instances and lists
- Prevent multiple instances of a given id or multiple lists of a given set from being created.
- Handle relationships between data.

This guide walks you through the basics of CanJS’s service layer modeling.


## Creating a model

CanJS’s pattern is such that you define application logic in one or more observables, then connect the observables to various browser APIs. CanJS’s model layer
libraries connect observables to backend services. CanJS’s model-layer will make
AJAX requests to get, create, update, and delete data.

For example, you
can connect a `Todo` and `Todo.List` observable to a restful service layer at
`/api/todos` with [can-rest-model]:

```js
import {restModel, DefineMap, DefineList} from "can";

const Todo = DefineMap.extend("Todo",{

    // `id` uniquely identifies instances of this type.
    id: { type: "number", identity: true },

	// properties on models can be given types as well as default values
    complete: { type: "boolean", default: false },
    dueDate: "date",
    name: "string",

    toggleComplete(){
        this.complete = !this.complete;
    }
});

Todo.List = DefineList.extend("TodoList",{
    "#": Todo,
    completeAll(){
        return this.forEach((todo) => { todo.complete = true; });
    }
});

const todoConnection = restModel({
    Map: Todo,
    List: Todo.List,
    url: "/api/todos/{id}"
});
```
@highlight 25-29
@codepen

This allows you to get, create, update and destroy data
programmatically through the `Todo` observable. [can-rest-model] mixes in the
following methods:

- `Todo.getList({filter: {complete: true}})` - _GET_ a list of todos from `/api/todos?filter[complete]=true`.
- `Todo.get({id: 5})` - _GET_ a single todo from `/api/todos/5`.
- `new Todo({name: "Learn CanJS"}).save()` - Create a todo by _POSTing_ it to `/api/todos`.
- `todo.save()` - Update a todo's data by _PUTing_ it to `/api/todos/5`.
- `todo.destroy()` - Delete a todo by _DELETE-ing_ it from `/api/todos/5`.


The following sections show examples of how to use these methods.

## Retrieving a list of records

Use [can-connect/can/map/map.getList] to retrieve records.

<table class="panels">
<tr>
    <th>JavaScript API</th>
    <th>Request</th>
    <th>Response</th>
</tr>
<tr class='background'>
<td>

Call `.getList` with _parameters_ used to filter, sort,
and paginate your list.

</td>
<td>

The _parameters_ are serialized
with [can-param] and added to the restful url.

</td>
<td>

Server responds with `data` property containing the
records. Configure for other formats with
[can-connect/data/parse/parse.parseListProp] or [can-connect/data/parse/parse.parseListData].

</td>
</tr>
<tr>
<td>

```js
Todo.getList({
  filter: {
    complete: false
  }
}) //-> Promise<TodoList[]>






```

</td>
<td>

```
GET /api/todos?
  filter[complete]=false









```

</td>
<td>

```js
{
  "data": [
    {
      "id": 20,
      "name": "mow lawn",
      "complete": false
    },
    ...
  ]
}
```

</td>
</tr>

</table>

`.getList(params)` returns a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
that will eventually resolve to a `Todo.List` of `Todo` instances.  This means that
properties and methods defined on `Todo.List` and `Todo` will be available:

```js
let todosPromise = Todo.getList({});

todosPromise.then(function(todos){
    todos    //-> Todos.List[Todo..]
    todos[0] //-> Todo{id: 1, name: "Learn CanJS", complete: false, ...}

    todos.completeAll();
    todos[0] //-> Todo{id: 1, name: "Learn CanJS", complete: true, ...}

    todos[0].toggleComplete();
    todos[0] //-> Todo{id: 1, name: "Learn CanJS", complete: false, ...}
})
```


The following creates a component that uses `Todo.getList` to load and list data:

```js
Component.extend({
    tag: "todo-list",
    view: `
    <ul>
        {{# if(todosPromise.isResolved) }}
            {{# for(todo of todosPromise.value) }}
                <li>
                    <input type='checkbox' checked:bind='todo.complete' disabled/>
                    <label>{{name}}</label>
                    <input type='date' valueAsDate:bind='todo.dueDate' disabled/>
                </li>
            {{/ for }}
        {{/ if}}
        {{# if(todosPromise.isPending) }}
            <li>Loading</li>
        {{/ if}}
    </ul>
    `,
    ViewModel: {
        todosPromise: {
            default(){
                return Todo.getList({});
            }
        }
    }
});
```

@highlight 5-6,22,only

> NOTE: A promise's values and state can be read in [can-stache] directly via:
> `promise.value`, `promise.reason`, `promise.isResolved`, `promise.isPending`, and `promise.isRejected`.

See the component in action here:

@demo demos/can-rest-model/can-rest-model-0.html
@codepen


The object passed to `.getList` can be used to filter, sort, and paginate
the items retrieved. The following adds inputs to control the filtering,
sorting, and pagination of the component:

```js
Component.extend({
    tag: "todo-list",
    view: `
    Sort By: <select value:bind="sort">
        <option value="">none</option>
        <option value="name">name</option>
        <option value="dueDate">dueDate</option>
    </select>

    Show: <select value:bind="completeFilter">
        <option value="">All</option>
        <option value="complete">Complete</option>
        <option value="incomplete">Incomplete</option>
    </select>

    Due: <select value:bind="dueFilter">
        <option value="">Anytime</option>
        <option value="today">Today</option>
        <option value="week">This Week</option>
    </select>

    Results <select value:bind="count">
        <option value="">All</option>
        <option value="10">10</option>
        <option value="20">20</option>
    </select>

    <ul>
        {{# if(todosPromise.isResolved) }}
            {{# for( todo of todosPromise.value) }}
                <li>
                    <input type='checkbox' checked:bind='todo.complete' disabled/>
                    <label>{{name}}</label>
                    <input type='date' valueAsDate:bind='todo.dueDate' disabled/>
                </li>
            {{/ for }}
        {{/ if}}
        {{# if(todosPromise.isPending) }}
            <li>Loading</li>
        {{/ if}}
    </ul>
    `,
    ViewModel: {
        sort: "string",
        completeFilter: "string",
        dueFilter: "string",
        count: {type:"string", default: "10"},
        get todosPromise(){
            let query = {filter: {}};
            if(this.sort) {
                query.sort =  this.sort;
            }
            if(this.completeFilter) {
                query.filter.complete = this.completeFilter === "complete";
            }
            if(this.dueFilter) {
                let day = 24*60*60*1000;
                let now = new Date();
                let today = new Date(now.getFullYear(), now.getMonth(), now.getDate() );
                if(this.dueFilter === "today") {

                    query.filter.dueDate = {
                        $gte: now.toString(),
                        $lt: new Date(now.getTime() + day).toString()
                    }
                }
                if(this.dueFilter === "week") {
                    let start = today.getTime() - (today.getDay() * day);
                    query.filter.dueDate = {
                        $gte: new Date(start).toString(),
                        $lt: new Date(start + 7*day).toString()
                    };
                }
            }
            if(this.count) {
                query.page = {
                    start: 0,
                    end: (+this.count)-1
                };
            }
            return Todo.getList(query);
        }
    }
});
```
@highlight 4-26,44-82,only

See it in action here:

@demo demos/can-rest-model/can-rest-model-1.html
@codepen

## Creating records ##

Use [can-connect/can/map/map.prototype.save] to create records.

<table class="panels">
<tr>
    <th>JavaScript API</th>
    <th>Request</th>
    <th>Response</th>
</tr>
<tr class='background'>
<td>

Create an instance and then call `.save()` to
create a record.

</td>
<td>

The instance is [can-define/map/map.prototype.serialize serialized]
and POSTed to the server.

</td>
<td>

Server responds with the [can-define.types.identity] value and
all other values on the record. Use
[can-connect/can/map/map.updateInstanceWithAssignDeep] to
not require every record value.

</td>
</tr>
<tr>
<td>

```js
const todo = new Todo({
  name: "make a model"
})
todo.save()  //-> Promise<Todo>


```

</td>
<td>

```
POST /api/todos
    {
      "name": "make a model",
      "complete": false
    }
```

</td>
<td>

```js
{
  "id": 22,
  "name": "make a model",
  "complete": false
}
```

</td>
</tr>
</table>

`.save()` returns a `Promise` that eventually resolves to the same instance that `.save()` was called
on.  While the record is being saved, [can-connect/can/map/map.prototype.isSaving]
will return `true`:

```js
const todo = new Todo({
  name: "make a model"
});

todo.isSaving() //-> false

todoPromise = todo.save();

todo.isSaving() //-> true

todoPromise.then(function(){
    todo.isSaving() //-> false
});
```


The following creates a component that uses `Todo.prototype.save` to create data:

```js
Component.extend({
    tag: "todo-create",
    view: `
        <form on:submit="createTodo(scope.event)">
            <p>
                <label>Name</label>
                <input on:input:value:bind='todo.name'/>
            </p>
            <p>
                <label>Complete</label>
                <input type='checkbox' checked:bind='todo.complete'/>
            </p>
            <p>
                <label>Date</label>
                <input type='date' valueAsDate:bind='todo.dueDate'/>
            </p>
            <button disabled:from="todo.preventSave()">Create Todo</button>
            {{# if(todo.isSaving()) }}Creating ....{{/ if}}
        </form>
    `,
    ViewModel: {
        todo: {
            Default: Todo
        },
        createTodo(event) {
            event.preventDefault();
            this.todo.save().then((createdTodo) => {
                // Create a new todo instance to receive from data
                this.todo = new Todo();
            })
        }
    }
});
```
@highlight 4,27

See this component in action here:

@demo demos/can-rest-model/can-rest-model-create.html
@codepen


Note that this demo lists newly created todos by listening to `Todo`’s created event as follows:

```js
Component.extend({
    tag: "created-todos",
    view: `
        <h3>Created Todos</h3>
        <table>
            <tr>
                <th>id</th><th>complete</th>
                <th>name</th><th>due date</th>
            </tr>
            {{# for(todo of this.todos) }}
                <tr>
                    <td>{{todo.id}}</td>
                    <td><input type='checkbox' checked:bind='todo.complete' disabled/></td>
                    <td>{{todo.name}}</td>
                    <td><input type='date' valueAsDate:bind='todo.dueDate' disabled/></td>
                </tr>
            {{ else }}
                <tr><td colspan='4'><i>The todos you create will be listed here</i></td></tr>
            {{/ for }}
        </table>
    `,
    ViewModel: {
        todos: {Default: Todo.List},
        connectedCallback(){
            this.listenTo(Todo,"created", (event, created) => {
                this.todos.unshift(created);
            })
        }
    }
});
```
@highlight 25,only

When any todo is `created`, `updated`, or `destroyed`, an event is dispatched on the `Todo` type.

## Updating records

Also use [can-connect/can/map/map.prototype.save] to update records.

<table class="panels">
<tr>
    <th>JavaScript API</th>
    <th>Request</th>
    <th>Response</th>
</tr>
<tr class='background'>
<td>

On an instance that has already been created,
change its data and call `.save()` to
update the record.

</td>
<td>

The instance is [can-define/map/map.prototype.serialize serialized]
and PUT to the server.

</td>
<td>

Server responds with all values on the record. Use
[can-connect/can/map/map.updateInstanceWithAssignDeep] to
not require every record value.

</td>
</tr>
<tr>
<td>

```js
todo.complete = true;
todo.save()  //-> Promise<Todo>




```

</td>
<td>

```
PUT /api/todos/22
    {
      "name": "make a model",
      "complete": true
    }
```

</td>
<td>

```js
{
  "id": 22,
  "name": "make a model",
  "complete": true
}
```

</td>
</tr>
</table>

For example, the
following creates a component that uses `Todo.prototype.save` to update data:

```js
Component.extend({
    tag: "todo-update",
    view: `
        {{# if(todo) }}
            <h3>Update Todo</h3>
            <form on:submit="updateTodo(scope.element, scope.event)">
                <p>
                    <label>Name</label>
                    <input name="name" value:from='todo.name' />
                </p>
                <p>
                    <label>Complete</label>
                    <input type='checkbox' name='complete'
                        checked:from='todo.complete'/>
                </p>
                <p>
                    <label>Date</label>
                    <input type='date'
                        name='dueDate' valueAsDate:from='todo.dueDate'/>
                </p>
                <button disabled:from="todo.preventSave()">
                    {{# if(todo.isSaving()) }}Updating{{else}}Update{{/ if}}Todo
                </button>
                <button disabled:from="todo.preventSave()"
                    on:click="cancelEdit()">Cancel</button>

            </form>
        {{ else }}
            <i>Click a todo above to edit it here.</i>
        {{/ if }}
    `,
    ViewModel: {
        todo: Todo,
        updateTodo(form, event) {
            event.preventDefault();
            this.todo.assign({
                name: form.name.value,
                complete: form.complete.checked,
                dueDate: form.dueDate.valueAsDate
            }).save().then(this.cancelEdit.bind(this))
        },
        cancelEdit(){
            this.todo = null;
        }
    }
});
```
@highlight 6,34-41

See this in action here:

@demo demos/can-rest-model/can-rest-model-update.html
@codepen

## Destroying records


Use [can-connect/can/map/map.prototype.destroy] to delete records.

<table class="panels">
<tr>
    <th>JavaScript API</th>
    <th>Request</th>
    <th>Response</th>
</tr>
<tr class='background'>
<td>

On an instance that has already been created,
call `.destroy()` to delete the record.

</td>
<td>

A DELETE request is sent with the instance's [can-define.types.identity].

</td>
<td>

No response data is necessary. Just
a successful status code.

</td>
</tr>
<tr>
<td>

```js
todo.destroy()  //-> Promise<Todo>
```

</td>
<td>

```
DELETE /api/todos/22
```

</td>
<td>

```
200 Status code.
```

</td>
</tr>
</table>


The following creates a component that uses `Todo.prototype.destroy` to delete data:

```js
Component.extend({
    tag: "todo-list",
    view: `
    <ul>
        {{# if(todosPromise.isResolved) }}
            {{# for(todo of todosPromise.value) }}
                <li>
                    <input type='checkbox' checked:bind='todo.complete' disabled/>
                    <label>{{todo.name}}</label>
                    <input type='date' valueAsDate:bind='todo.dueDate' disabled/>
                    <button on:click="todo.destroy()">delete</button>
                </li>
            {{/ for }}
        {{/ if}}
        {{# if(todosPromise.isPending) }}
            <li>Loading</li>
        {{/ if}}
    </ul>
    `,
    ViewModel: {
        todosPromise: {
            default(){
                return Todo.getList({});
            }
        },
        connectedCallback(){
            this.todosPromise.then((todos)=>{
                this.listenTo(Todo, "destroyed", function(ev, destroyed){
                    let index = todos.indexOf(destroyed);
                    todos.splice(index, 1);
                });
            });
        }
    }
});
```
@highlight 6,11,only

The following example shows this in action. Click the <button>delete</button> button to delete
todos and have the todo removed from the list.

@demo demos/can-rest-model/can-rest-model-destroy.html
@codepen

This demo works by calling [can-connect/can/map/map.prototype.destroy] when the <button>delete</button> button
is clicked.

```html
<button on:click="destroy()">delete</button>
```

To keep the list of todos up to date, the above demo works by listening
when any todo is destroyed and removing it from the list:

```js
connectedCallback(){
    this.todosPromise.then((todos)=>{
        this.listenTo(Todo, "destroyed", function(ev, destroyed){
            let index = todos.indexOf(destroyed);
            todos.splice(index, 1);
        });
    });
}
```


## Update lists when records are mutated

The previous _Creating Records_, _Updating Records_ and _Destroying Records_
examples showed how to listen to when records are mutated:

```js
this.listenTo(Todo,"created",   (event, createdTodo)   => { ... })
this.listenTo(Todo,"updated",   (event, updatedTodo)   => { ... })
this.listenTo(Todo,"destroyed", (event, destroyedTodo) => { ... })
```

These listeners can be used to update lists similar to how the _Destroying Records_
example removed lists:

```js
connectedCallback(){
    this.todosPromise.then( (todos)=>{
        this.listenTo(Todo, "created", function(ev, created){
            // ADD created to `todos`
        })
        this.listenTo(Todo, "destroyed", function(ev, destroyed){
            // REMOVE destroyed from `todos`
        });
        this.listenTo(Todo, "updated", function(ev, updated){
            // ADD, REMOVE, or UPDATE the position of updated
            // within `todos`
        });
    });
}
```

But this is cumbersome, especially when lists contain
sorted and filtered results. For example, if you are displaying
only completed todos, you might not want to add newly created
incomplete todos. The following only pushes complete todos onto `todos`:

```js
ViewModel: {
    todosPromise: {
        default(){
            return Todo.getList({filter: {complete: true}});
        }
    },
    connectedCallback(){
        this.todosPromise.then((todos)=>{
            this.listenTo(Todo, "created", (ev, createdTodo) => {
                // make sure the todo is complete:
                if(createdTodo.complete) {
                    todos.push(complete);
                }
            });
        });
    }
}
```
@highlight 11-13

Fortunately, [can-realtime-rest-model] using [can-query-logic] can
automatically update lists for you! If your service layer matches
what [can-query-logic] expects, you can just replace [can-rest-model] with
[can-realtime-rest-model] as follows:

```js
import {realtimeRestModel, DefineMap, DefineList} from "can";

const Todo = DefineMap.extend("Todo",{
    id: { type: "number", identity: true },
    complete: { type: "boolean", default: false },
    dueDate: "date",
    name: "string"
});

Todo.List = DefineMap.extend("TodoList",{
    "#": Todo
});

const todoConnection = realtimeRestModel({
    Map: Todo,
    List: Todo.List,
    url: "/api/todos/{id}"
});
```
@highlight 1,14

> NOTE: You can configure [can-query-logic] to match your service layer. Learn
> more in the [configuration section of can-query-logic](../can-query-logic.html#Configuration).


The following uses [can-realtime-rest-model] to create a _filterable_ and _sortable_ grid
that automatically updates itself when todos are created, updated or destroyed.

Try out the following use cases that [can-realtime-rest-model] provides automatically:

- Delete a todo and the todo will be removed from the list.
- Sort by date, then create a todo and the todo will be inserted into the right place in the list.
- Sort by date, then edit a todo's `dueDate` and the todo will be moved to the right place in the list.
- Show only `Complete` todos, then toggle the todo's complete status and the todo will be removed
  from the view.

@demo demos/can-realtime-rest-model/can-realtime-rest-model.html
@codepen

By default, [can-query-logic] assumes your service layer will match a [can-query-logic/query default query structure]
that looks like:

```js
Todo.getList({
    // Selects only the todos that match.
    filter: {
        complete: {$in: [false, null]}
    },
    // Sort the results of the selection
    sort: "-name",
    // Selects a range of the sorted result
    page: {start: 0, end: 19}
})
```

This structures follows the [Fetching Data JSONAPI specification](http://jsonapi.org/format/#fetching).

There's a:

- [filter](http://jsonapi.org/format/#fetching-filtering) property for filtering records,
- [sort](http://jsonapi.org/format/#fetching-sorting) property for specifying the order to sort records, and
- [page](http://jsonapi.org/format/#fetching-pagination) property that selects a range of the sorted result. _The range indexes are inclusive_.

> __NOTE__: [can-realtime-rest-model] does not follow the rest of the JSONAPI specification. Specifically
> [can-realtime-rest-model] expects your server to send back JSON data in a different format.

If you control the service layer, we __encourage__ you to make it match the default
[can-query-logic/query query structure] to avoid configuration.  The default query structure also supports the following [can-query-logic/comparison-operators]: `$eq`, `$gt`, `$gte`, `$in`,
`$lt`, `$lte`, `$ne`, `$nin`.

If you are unable to match the default query structure, or need special behavior, read the
[configuration section of can-query-logic](../can-query-logic.html#Configuration)
to learn how to configure a custom query logic.
