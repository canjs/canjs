@module can-memory-store can-memory-store
@parent can-data-modeling
@collection can-infrastructure
@group can-memory-store.data-methods data methods
@package ./package.json

Create, update, delete and query data saved in memory.

@signature `memoryStore( baseConnection )`

Create a database-like store of a single data type. For example:

```js
import memoryStore from "can-memory-store";
import QueryLogic from "can-query-logic";

// Create a store
var todosStore = memoryStore({
    queryLogic: new QueryLogic({
        identity: ["id"]
    })
});

// Add a list of data to the store
todosStore.updateListData(...);
// Get a list of data from the store
todosStore.getListData(...)
// Create a record in the store
todosStore.createData(...)
// Get a record in the store
todosStore.getData(...)
// Update a record in the store
todosStore.updateData(...)
// Remove a record from the store
todosStore.destroyData(...)
// Clear all records from the store
todosStore.clear()
// Get the queries that are currently stored
todosStore.getQueries()
```

@param {Object} [baseConnection] A base [can-connect] connection or a settings object. `baseConnection`
  must have a `queryLogic` property that references a [can-query-logic] instance. The `can-query-logic`
  instance is used to determine the behavior of [can-memory-store.getListData].


@body

## Use

`can-memory-store` is used as a store of query-able data.  It can either be used on its own or
as part of a [can-connect] cache connection.

### Standalone use

To use `memoryStore`, first create one with a `queryLogic` instance:

```js
import memoryStore from "can-memory-store";
import QueryLogic from "can-query-logic";

// Create a store
var todosStore = memoryStore({
    queryLogic: new QueryLogic({
        identity: ["id"]
    })
});
```

Then populate the store with data:

```js
todosStore.updateListData([
    {id: 1, name: "dishes", points: 2},
    {id: 2, name: "lawn", points: 8},
    {id: 3, name: "trash", points: 1},
    {id: 4, name: "car wash", points: 5},
]);
```

Then you can query the store for data:

```js
todosStore.getListData({
    filter: {points: {$gt: 1}},
    sort: "name",
    page: {start: 0, end: 1}
})
//-> {
//   data: [
//     {id: 4, name: "car wash", points: 5},
//     {id: 1, name: "dishes", points: 2}],
//   count: 3
// }
```

### Use with connection


`can-memory-store` is often used with a caching strategy like [can-connect/fall-through-cache/fall-through-cache] or
[can-connect/cache-requests/cache-requests] as their
`cacheConnection`. The following gives an example of using it with the
`connectFallThroughCache`:

```js
import {
    DefineMap,
    QueryLogic,
    memoryStore,
    connectFallThroughCache,
    connectCanMap,
    connectRest,
    connectConstructor,
    connect
} from "can";

// Define a type
const Todo = DefineMap.extend("Todo",{
    id: {identity: true, type:"number"},
    name: "string",
    complete: "boolean"
});

// Create a store
var todosStore = memoryStore({
    queryLogic: new QueryLogic(Todo)
});

var todoConnection = connect([
  connectRest,
  connectMap,
  connectFallThroughCache,
  connectConstructor
],
{
  url: "/services/todos",
  cacheConnection: todosStore
});
```
