@page guides/data-modeling Data Modeling Guide
@parent guides/getting-started

@description Learn how to build a data layer that makes working with
a backend service layer easy.

@body

## Purpose

The purpose of CanJS's data modeling packages is to make it
easy to connect your application to a backend data source.

While `fetch`, [can-ajax], and [XMLHTTPRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) can be used directly in a CanJS application,
using CanJS's data modeling tools can solve some difficult problems with little configuration:


- Provide a standard interface for retrieving, creating, updating, and deleting data.
- Convert raw data from the server to typed data, with methods and special property behaviors.
- Caching
- Real time updates of instances and lists
- Prevent multiple instances of a given id or multiple lists of a given set from being created.
- Handle relationships between data.

CanJS has 3 core concepts:

-


Example:

- getting data from a server
- creating new data (as a result of submitting a form)

- destroying data


- updating the page when someone else creates data

This is done by configuring a
    `service`

    and `connecting` it to an observable.

Thus, to understand CanJS's model layer, you primarily need to understand
two main packages:

- can-service - Describe the nature of a service layer. How to create, update, etc.
- can-connect - Connects the service layer to an observable type. This is what
  creates methods on the observable to perform actions on the service layer.

It will also be worth understanding `can-query`, which is the standard way
that you request data.

This guide will walk you through creating a basic connection, adding real-time
behavior, customizing


- can-query - params
- can-service - getListData
    -
- can-connection - INSTANCES


## Quick setup

A basic setup looks like this:

```js
import ServiceRest from "can-service-rest";
import connectRealtime from "can-connect-realtime";
import observe from "can-observe";

// First define a type for instances loaded from the server.
Todo extends observe.Object {}

// And create a type for lists of instances from the server.
TodoList extends observe.Array {}

// Create a restful service.  This lets someone
// CRUD todos "statically"
// todosService.createData()
// todoService.getData()
// todosService.updateData()
// todosService.getListData()
// All of these comply with query / data
const todosService = new ServiceRest("/todos");

// Adds:
// Todo.getList()
// todo.save()
// todo.destroy()
// Todo.get()
// todosConnection.createInstance
// todosConnection.updateInstance
// todosConnection.destroyInstance
const todosConnection = connectRealtime({
    service: todosServices,
    Instance: Todo,
    Instances: TodoList,
    // optional cacheService
});
```

### Setup  2


```js
import ServiceRest from "can-service-rest";
import realtime from "can-connect-realtime";
import CanConnection from "can-connection";
import observe from "can-observe";


var service = new ServiceRest("/todos")

@connect( service )
@list(TodoList extends observe.Array {})
// First define a type for instances loaded from the server.
Todo extends observe.Object {}

// And create a type for lists of instances from the server.
@connectList(service)
TodoList extends observe.Array {}

// Create a restful service.  This lets someone
// CRUD todos "statically"
// todosService.createData()
// todoService.getData()
// todosService.updateData()
// todosService.getListData()
// All of these comply with query / data
const todosService = new ServiceRest("/todos");

@realtime
class TodoConnection extends CanConnection {}

TodoConnection.attach({ .... });

var connection = new TodoConnection({
    service: todosService,
    Instance: Todo,
    Instances: TodoList
})

connection.getList();
connection.save(todo);

Todo.getList()

new Todo();
```

var connection = new TodoConnection({
        service: {
            getListData: function(){
                return Promise.resolve([{},{},{}])
            }
        }
})
connection.Todo

Todo.getList({}) //->


connection.break();


exports CoreTodo

@realtime
exports class TodoConnection extends CanConnection {
  Instance= Todo;
  Instances = TodoList;
  Service: TodosService
}


exports {Instance: Todo, Instances: TodoList} = new TodoConnection(Todo)
