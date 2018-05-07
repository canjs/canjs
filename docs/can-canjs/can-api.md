@page api API Docs
@parent canjs 2
@group can-observables 1 Observables
@group can-data-modeling 2 Data Modeling
@group can-views 3 Views
@group can-routing 4 Routing
@group can-js-utilities 5 JS Utilities
@group can-dom-utilities 6 DOM Utilities
@group can-data-validation 7 Data Validation
@group can-typed-data 8 Typed Data
@group can-polyfills 9 Polyfills
@outline 1
@package ../../package.json
@templateRender <% %>
@subchildren
@description Welcome to the CanJS API documentation! This page is a cheat-sheet for the most common APIs within CanJS.

@body

## Observables

```js
import {DefineMap, DefineList} from "can";

// Define an observable Todo type.
const Todo = DefineMap.extend("Todo",{

    // `id` is a Number, null, or undefined and
    // uniquely identifies instances of this type.
    id: { type: "number", identity: true },

    // `complete` is a Boolean, null or undefined
    // and defaults to `true`.
    complete: { type: "boolean", default: true },

    // `dueDate` is a Date, null or undefined.
    dueDate: "date",

    // `isDueWithin24Hours` property returns if the `.dueDate`
    // is in the next 24 hrs.
    get isDueWithin24Hours(){
        var msLeft = this.dueDate - new Date();
        return msLeft >= 0 && msLeft <= 24 * 60 * 60 * 1000;
    },

    // `name` is a String, null or undefined.
    name: "string",
    // `nameChangeCount` increments when `name` changes.
    nameChangeCount: {
        value({listenTo, resolve}) {
            var count = resolve(0);
            listenTo("name", ()=> {
                resolve(++count);
            })
        }
    },

    owner: {
        Type: {
            first: "string",
            last: "string"
        }
    },

    // `toggleComplete` is a method
    toggleComplete(){
        this.complete != this.complete;
    }
});

const TodoList = DefineList.extend("TodoList",{
    "#": {Type: Todo},

    get complete(){
        return this.filter({complete: true})
    }
})

// Create a todo instance:
var todo = new Todo({name: "Learn Observables"});

// Change a property:
todo.dueDate = new Date().getTime() + 1000*60*60;


// Listen to changes
var handler = function(ev, newVal, oldVal){};
todo.on("complete", handler);
// Stop listening to changes
todo.off("complete", handler);

// Listen to changes that can be easily unregistered
todo.listenTo("complete", function(ev, newVal, oldVal){})
// Stop listening to all registered handlers
todo.stopListening();

// Call a method
todo.toggleComplete();

// Assign properties
todo.assign({
    owner: {
        first: "Justin", last: "Meyer"
    }
});
```

<details>
<summary>Infrastructure APIs</summary>

```js
const fullName = new Observation( function() {
    return person.first + " " + person.last;
} );
```

</details>

## Data Modeling

```js
import {fixture, queryLogic,
        restModel, realtimeRestModel,
        superModel} from "can";

// Define a basic restful model:
const todoConnection = restModel({
    Map: Todo,
    List: Todo.List,
    url: "/api/todos/{id}"
});

// Define a real time restful model
const todoConnection = realtimeRestModel({
    Map: Todo,
    List: Todo.List,
    url: "/api/todos/{id}"
});
// Update instances and lists from server-side events:
socket.on('todo created', (todo) => {
    todoConnection.createInstance(order);
}).on('todo updated', (todo) => {
    todoConnection.updateInstance(order);
}).on('todo removed', (todo) => {
    todoConnection.destroyInstance(order);
});

// Define a real time restful model with fall-through
// localStorage caching
const todoConnection = superModel({
    Map: Todo,
    List: Todo.List,
    url: "/api/todos/{id}"
});


// Get promise that resolves to a `TodoList` of `Todo` instances
// ======>
// GET /api/todos?
//      filter[complete][$in][]=false&
//      filter[complete][$in][]=null&
//      sort=-name&
//      page[start]=0&
//      end=19
// <======
// {data: [{id: 1, name: "mow lawn", ...}, ...]}
Todo.getList({
    // Selects only the todos that match.
    filter: {
        complete: {$in: [false, null]}
    },
    // Sort the results of the selection
    sort: "-name",
    // Selects a range of the sorted result
    page: {start: 0, end: 19}
});

// Get a promise that resolves to a single `Todo` by id
Todo.get({id: 5});


var todo = new Todo({name: "Learn CanJS"});
// Check if a todo has not been persisted to the server
todo.isNew() //-> true

// Create a model on the server.
// POST /api/todos {name: "Learn CanJS", complete: false, ...}
todo.save()

// Update a model on the server.
// PUT /api/todos/15 {name: "Learn CanJS", complete: true, ...}
todo.complete = true;
todo.save();

// Check if a model is saving
todo.isSaving() //-> Boolean

// Delete a model
// DELETE /api/todos/15
todo.destroy()
// Check if a model is being destroyed
todo.isDestroying() //-> Boolean
```

## Views

```js
import {Component} from "can";

Component.extend({
    tag: "my-counter",
    // `on:click` listens to a click.
    // `{{count}}` reads the count from the view model
    view: `
        <input value:to="string-to-any(increment)"/>
        <button on:click="add(1)">+1</button>
        {{count}}
    `,
    ViewModel: {
        count: {type: "number", default: 0},
        add(increment){
            this.count += increment;
        }
    }
});
```

<table>
<tr>
<td>
value:to="key"
</td>
<td>
blah
</td>
</tr>
</table>
