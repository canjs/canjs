@module {function} can-query-logic
@parent can-data-modeling
@collection can-core
@group can-query-logic.prototype 1 prototype
@group can-query-logic/query-format 2 query format
@group can-query-logic.static 3 static methods
@package ../package.json

@group can-query-logic.static-types 4 static types
@outline 3

@description Perform data queries and compare
queries against each other. Provides logic useful for
data caching and real-time behavior.

@signature `new QueryLogic( [schemaOrType] [,options] )`

  The `can-query-logic` package exports a constructor function that builds _query logic_
  from:

  - an optional schema or type argument, and
  - an optional `options` argument used to convert alternate parameters to
  the expected [can-query-logic/query] format.


  For example, the following builds _query logic_ from a [can-define/map/map]:

  @sourceref ./examples/todo-example.js
  @codepen
  @highlight 3-10,12,only

  Once a _query logic_ instance is created, it can be used to
  perform actions using [can-query-logic/query queries].  For example,
  the following might select 20 incomplete todos from a list of todos:

  @sourceref ./examples/todo-example.js
  @codepen
  @highlight 14-24,only

  By default `can-query-logic` supports queries represented by the [can-query-logic/query]
  format.  It supports a variety of operators and options.  It looks like:

  ```js
  import {QueryLogic} from "can";
  import {Todo} from "//unpkg.com/can-demo-models@5";

  const todoQueryLogic = new QueryLogic(Todo);
  // Perform query logic:
  const filter = todoQueryLogic.filterMembers({
    // Selects only the todos that match.
    filter: {
      complete: false
    },
    // Sort the results of the selection
    sort: "-name",
    // Selects a range of the sorted result
    page: {start: 0, end: 19}
  },[
    {id: 1, name: "do dishes", complete: false},
    {id: 2, name: "mow lawn", complete: true},
    // ...
  ]);
  console.log( filter ); //-> [{id: 1, name: "do dishes", complete: false}]

  ```
  @codepen
  @highlight 6-15,only

@param {function|can-reflect/schema} schemaOrType Defines the behavior of keys on a [can-query-logic/query]. This is done with either:

- A constructor function that supports [can-reflect.getSchema can-reflect.getSchema]. Currently, [can-define/map/map] supports the `can.getSchema` symbol:
  @sourceref ./examples/todo-example.js
  @codepen
  @highlight 3,10,only

- A [can-reflect.getSchema schema object] that looks like the following:

  ```js
  import {QueryLogic, MaybeNumber, MaybeString, MaybeBoolean} from "can";

  const queryLogic = new QueryLogic({
    // keys that uniquely represent this type
    identity: ["id"],
    keys: {
      id: MaybeNumber,
      name: MaybeString,
      complete: MaybeBoolean
    }
  });

  const result = queryLogic.filterMembers({ filter: {complete: false}}, [
    {id: "1", name: "Justin", complete: "truthy"},
    {id: "2", name: "Paula", complete: ""},
    {id: "3", name: "Kevin", complete: true}
  ]);

  console.log( result );
  ```
  <!-- Example doesn't work. Issue open: https://github.com/canjs/can-data-types/issues/7 -->
  <!-- @codepen -->

  Note that if a key type (ex: `name: MaybeString`) is __not__ provided, filtering by that
  key will still work, but there won't be any type coercion. For example, the following
  might not produce the desired results:

  ```js
  import {QueryLogic} from "can";

  const queryLogic = new QueryLogic();
  const unionized = queryLogic.union(
    {filter: {age: 7}},
    {filter: {age: "07"}}
  );
  console.log( JSON.stringify( unionized ) ); //-> "{'filter':{'age':{'$in':[7,'07']}}}"
  ```
  @codepen

  Use types like [can-data-types/maybe-number/maybe-number] if you want to add basic
  type coercion:

  ```js
  import {QueryLogic, MaybeNumber} from "can";

  const queryLogic = new QueryLogic({
    identity: ["id"],
    keys: {age: MaybeNumber}
  });
  const unionized = queryLogic.union(
    {filter: {age: 7}},
    {filter: {age: "07"}}
  );
  console.log( JSON.stringify( unionized ) ); //-> {filter: {age: 7}}
  ```
  @codepen


  If you need even more special key behavior, read [defining properties with special logic](#Definingfilterpropertieswithspeciallogic).

  By default, filter properties like `status` in `{filter: {status: "complete"}}`
  are used to create to one of the [can-query-logic/comparison-operators] like
  `GreaterThan`. A matching schema key will overwrite this behavior. How this
  works is explained in the [Defining filter properties with special logic](#Definingfilterpropertieswithspeciallogic) section below.

  @param {Object} [options] The following _optional_ options are used to translate between the standard [can-query-logic/query] and the parameters the server expects:

  - `toQuery(params)` - Converts from the parameters used by the server to the standard [can-query-logic/query].
  - `toParams(query)` - Converts from the standard [can-query-logic/query] to the parameters used by the server.

  The [Changing the query structure](#Changingthequerystructure) section below describes how to use these options to match your query's logic to your servers.

@body

## Purpose

`can-query-logic` is used to give CanJS an _understanding_ of what __the parameters used to
retrieve a list of data__ represent.  This awareness helps other libraries like
[can-connect] and [can-fixture] provide real-time, caching and other behaviors.

__The parameters used to retrieve a list of data?__

In many applications, you request a list of data by making a `fetch` or `XMLHTTPRequest`
to a url like:

```
/api/todos?filter[complete]=true&sort=name
```

The values after the `?` are used to control the data that comes back. Those values are
[can-deparam deserialized] into
a query object look like this:

```js
{
  filter: {complete: true},
  sort: "name"
}
```

This object represents a [can-query-logic/query Query]. This specific query is for requesting completed todos and have the todos sorted by their _name_.  

A `QueryLogic` instance _understands_ what a `Query` represents. For example, it can filter records
that match a particular query:

```js
import {QueryLogic} from "can";

const todos = [
  { id: 1, name: "learn CanJS",   complete: true  },
  { id: 2, name: "wash the car",  complete: false },
  { id: 3, name: "do the dishes", complete: true  }
];

const queryLogic = new QueryLogic();

const result = queryLogic.filterMembers({
  filter: {complete: true},
  sort: "name",
}, todos);

console.log( result ); //-> [
//  { id: 3, name: "do the dishes", complete: true  },
//  { id: 1, name: "learn CanJS",   complete: true  }
//]
```
@codepen

The [can-query-logic.prototype.filterMembers] method allows `QueryLogic` to be used similar to a database. `QueryLogic` instances methods help solve other problems too:

- __real-time__ - [can-query-logic.prototype.isMember] returns if a particular item
belongs to a query and [can-query-logic.prototype.index] returns the location where that item belongs.
- __caching__ - [can-query-logic.prototype.isSubset] can tell you if you've already loaded
  data you are looking for.  [can-query-logic.prototype.difference] can tell you what data
  you need to load that already isn't in your cache.

In fact, `can-query-logic`'s most unique ability is to be able to directly compare
queries that represent sets of data instead of having to compare
the data itself. For example, if you already loaded all completed todos,
`can-query-logic` can tell you how to get all remaining todos:

```js
import {QueryLogic} from "can";

const completedTodosQuery = {filter: {complete: false}};
const allTodosQuery = {};

const queryLogic = new QueryLogic();
const remainingTodosQuery = queryLogic.difference(allTodosQuery, completedTodosQuery);

console.log( JSON.stringify( remainingTodosQuery ) ); //-> "{'filter':{'complete':{'$ne':false}}}"
```
@codepen

## Use

There are two main uses of `can-query-logic`:

- Configuring a `QueryLogic` instance to match your service behavior.
- Using a `QueryLogic` instance to create a new [can-connect] behavior.

## Configuration

Most people will only ever need to configure a
`QueryLogic` logic instance.  Once properly configured, all [can-connect] behaviors will
work correctly.  If your service parameters match the [can-query-logic/query default query structure],
you likely don't need to use `can-query-logic` directly at all.  However, if your service parameters differ from
the [can-query-logic/query default query structure] or they need additional logic, some configuration will be necessary.

### Matching the default query structure

By default, `can-query-logic` assumes your service layer will match a [can-query-logic/query default query structure]
that looks like:

```js
import {QueryLogic} from "can";

const queryLogic = new QueryLogic()

const filter = queryLogic.filterMembers({
  // Selects only the todos that match.
  filter: {
    complete: {$in: [false, null]}
  },
  // Sort the results of the selection
  sort: "-name",
  // Selects a range of the sorted result
  page: {start: 0, end: 19}
},
[
  {id: 1, name: "do dishes", complete: false},
  {id: 2, name: "mow lawn", complete: true},
  // ...
]);

console.log( filter ); //-> [{id: 1, name: "do dishes", complete: false}]
```
@codepen
@highlight 6-13

This structures follows the [Fetching Data JSONAPI specification](http://jsonapi.org/format/#fetching).

There's:

- a [filter](http://jsonapi.org/format/#fetching-filtering) property for filtering records,
- a [sort](http://jsonapi.org/format/#fetching-sorting) property for specifying the order to sort records, and
- a [page](http://jsonapi.org/format/#fetching-pagination) property that selects a range of the sorted result. _The range indexes are inclusive_.

> __NOTE__: [can-connect] does not follow the rest of the JSONAPI specification. Specifically
> [can-connect] expects your server to send back JSON data in a different format.

If you control the service layer, we __encourage__ you to make it match the default
[can-query-logic/query].  The default query structure also supports the following [can-query-logic/comparison-operators]: `$eq`, `$gt`, `$gte`, `$in`, `$lt`, `$lte`, `$ne`, `$nin`.

If you support the default structure, it's very likely the entire configuration you need to perform will
happen on the data type you pass to your [can-connect can-connect connection]. For example,
you might create a `Todo` data type and pass it to a connection like this:

```js
import {DefineMap, DefineList, realtimeRestModel} from "can";
import {Todo, todoFixture} from "//unpkg.com/can-demo-models@5";

// creates a mock todo api
todoFixture(1);

Todo.List = DefineList.extend("TodoList", {
  "#": {Type: Todo}
});

Todo.connection = realtimeRestModel({
  url: "/api/todos/{id}",
  Map: Todo
});

Todo.getList().then(todos => {
  todos.forEach(todo => {
    console.log(todo.name); // logs todos
  });
});

```
@codepen
@highlight 11-14,only

Internally, `realTimeRest` is using `Todo` to create and configure a `QueryLogic`
instance for you.  The previous example is equivalent to:

```js
import {DefineMap, DefineList, realtimeRestModel, QueryLogic} from "can";
import {Todo, todoFixture} from "//unpkg.com/can-demo-models@5";

// creates a mock todo api
todoFixture(1);

Todo.List = DefineList.extend("TodoList", {
  "#": {Type: Todo}
});

const todoQueryLogic = new QueryLogic(Todo);

Todo.connection = realtimeRestModel({
  url: "/api/todos/{id}",
  Map: Todo,
  queryLogic: todoQueryLogic
});

Todo.getList().then(todos => {
  todos.forEach(todo => {
    console.log(todo.name); // logs todos
  });
});

```
@codepen
@highlight 11,16,only

If your services don't match the default query structure or logic, read on to
see how to configure your query to match your service layer.

### Changing the query structure

If the logic of your service layer matches the logic of the [can-query-logic/query default query], but the form
of the query parameters is different, the easiest way to configure the `QueryLogic` is to
translate your parameter structure to the [can-query-logic/query default query structure].

For example, to change queries to use `where` instead of `filter` so that queries can be
made like:

```js
import {DefineMap, DefineList, realtimeRestModel, QueryLogic} from "can";
import {Todo, todoFixture} from "//unpkg.com/can-demo-models@5";

// creates a mock todo api
todoFixture(5);

Todo.List = DefineList.extend("TodoList", {
  "#": {Type: Todo}
});

const todoQueryLogic = new QueryLogic(Todo);

Todo.connection = realtimeRestModel({
  url: "/api/todos/{id}",
  Map: Todo,
});

Todo.getList({filter: {complete: true}}).then(todos => {
  todos.forEach(todo => {
    console.log(todo.name); // logs completed todos
  });
});

```
@codepen
@highlight 18,22,only

You can use the `options`' `toQuery` and `toParams` functions
to set the `filter` property value to the passed in `where` property value.

```js
import {DefineMap, QueryLogic, realtimeRestModel} from "can";
import {Todo, todoFixture} from "//unpkg.com/can-demo-models@5";

todoFixture(5);

// CREATE YOUR QUERY LOGIC
const todoQueryLogic = new QueryLogic(Todo, {
  // Takes what your service expects: {where: {...}}
  // Returns what QueryLogic expects: {filter: {...}}
  toQuery(params){
    const where = params.where;
    delete params.where;
    params.filter = where;
    return params;
  },
  // Takes what QueryLogic expects: {filter: {...}}
  // Returns what your service expects: {where: {...}}
  toParams(query){
    const where = query.filter;
    delete query.filter;
    query.where = where;
    return query;
  }
});

Todo.List = DefineList.extend("TodoList", {
  "#": {Type: Todo}
});

// PASS YOUR QueryLogic TO YOUR CONNECTION
Todo.connection = realtimeRestModel({
  url: "/api/todos/{id}",
  Map: Todo,
  queryLogic: todoQueryLogic
});

Todo.getList({filter: {complete:true}}).then(todos => {
  todos.forEach(todo => {
    console.log(todo.name); // shows FILTERED todos
  });
});

```
@codepen


### Defining filter properties with special logic

If the logic of the [can-query-logic/query default query] is not adequate to represent
the behavior of your service layer queries, you can define special classes called `SetType`s to
provide the additional logic.

Depending on your needs, this can be quite complex or rather simple. The following sections
provide configuration examples in increasing complexity.

Before reading the following sections, it's useful to have some background information on
how `can-query-logic` works.  We suggest reading the [How it works](#Howitworks) section.

#### Built-in special types

`can-query-logic` comes with functionality that can be used to create special logic. For example,
the [can-query-logic.makeEnum] method can be used to build a `Status` type that contains ONLY the
enumerated values:

```js
import {QueryLogic, DefineMap} from "can";

const Status = QueryLogic.makeEnum(["new","assigned","complete"]);

const Todo = DefineMap.extend({
  id: "number",
  status: Status,
  complete: "boolean",
  name: "string"
});

const todoLogic = new QueryLogic(Todo);
const unionQuery = todoLogic.union(
  {filter: {status: ["new","assigned"] }},
  {filter: {status: "complete" }}
)

console.log( unionQuery ); //-> {}
```
@codepen

> NOTE: `unionQuery` is empty because if we loaded all todos that
> are new, assigned, and complete, we've loaded every todo.  
> The `{}` query would load every todo.

#### Custom types that work with the comparison operators

If a number or string can represent your type, then you can create a `SetType` class
that can be used with the comparison operators.

The `SetType` needs to be able to translate back and forth from
the values in the query to a number or string.

For example, you might want to represent a date with a string like:

```js
{
    filter: {date: {$gt: "Wed Apr 04 2018 10:00:00 GMT-0500 (CDT)"}}
}
```

The following creates a `DateStringSet` that translates a date string to a number:

@sourceref ./examples/date-string-example.js
@codepen

These classes must provide:

- `constructor` - initialized with the the value passed to a comparator (ex: `"Wed Apr 04 2018 10:00:00 GMT-0500 (CDT)"`).
- [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/valueOf valueOf] - return a string or number used to compare (ex: `1522854000000`).
- `Symbol.for("can.serialize")` - returns a string or number to compare against [can-data-types] for the query.

To configure a `QueryLogic` to use a `SetType`, it must be the `can.SetType` property on a
schema's `keys` object.  This can be done directly like:

```js
new QueryLogic({
  keys: {
    date: {[Symbol.for("can.SetType")]: DateStringSet}
  }
});
```

More commonly, `DateStringSet` is the `can.SetType` symbol of a type like:

@sourceref ./examples/date-string-example.js
@codepen
@highlight 19-21,only

Then this `DateString` is used to configure your data type like:

@sourceref ./examples/date-string-example.js
@codepen
@highlight 23-27,only

> NOTE: Types like `DateString` need to be distinguished from `SetType`s like
> `DateStringSet` because types like `DateString` have different values. For example,
> a `DateStringSet` might have a value like "yesterday", but this would not be a valid
> `DateString`.


#### Completely custom types

If you want total control over filtering logic, you can create a `SetType` that
provides the following:

- methods:
  - `can.isMember` - A function that returns if an object belongs to the query.
  - `can.serialize` - A function that returns the serialized form of the type for the query.
- comparisons:
  - `union` - The result of taking a union of two `SetType`s.
  - `intersection` - The result of taking an intersection of two `SetType`s.
  - `difference` - The result of taking a difference of two `SetType`s.

The following creates a `SearchableStringSet` that is able to perform searches that match
the provided text like:

```js
import {QueryLogic} from "can";

const recipes = [
  {id: 1, name: "garlic chicken"},
  {id: 2, name: "ice cream"},
  {id: 3, name: "chicken kiev"}
];

const queryLogic = new QueryLogic();
const result = queryLogic.filterMembers({
  filter: {name: "chicken"}
}, recipes);

console.log( result ); //-> []
```
@codepen

Notice how all values that match `chicken` are returned.

@sourceref ./examples/recipe-example.js
@codepen
@highlight 3-75,only

To configure a `QueryLogic` to use a `SetType`, it must be the `can.SetType` property on a
schema's `keys` object.  This can be done directly like:

@sourceref ./examples/recipe-example.js
@codepen
@highlight 84-86,only

More commonly, `SearchableStringSet` is the `can.SetType` symbol of a type like:

@sourceref ./examples/searchable-todo-example.js
@codepen
@highlight 78-80,only

Then this `SearchableString` is used to configure your data type like:

@sourceref ./examples/searchable-todo-example.js
@codepen
@highlight 82-85,only

> NOTE: Types like `SearchableString` need to be distinguished from `SetType`s like
> `SearchableStringSet` because types like `SearchableString` have different values. For example,
> a `SearchableStringSet` might have a value like "yesterday", but this would not be a valid
> `SearchableString`.


### Testing your QueryLogic

It can be very useful to test your `QueryLogic` before using it with [can-connect].

```js
import {DefineMap, QueryLogic} from "can";

const Todo = DefineMap.extend({ ... });

const queryLogic = new QueryLogic(Todo, {
  toQuery(params){ ... },
  toParams(query){ ... }
});

unit.test("isMember", function(){
  const result = queryLogic.isMember({
    filter: {special: "SOMETHING SPECIAL"}
  },{
    id: 0,
    name: "I'm very special"
  });
  assert.ok(result, "is member");
});

```

## How it works

The following gives a rough overview of how `can-query-logic` works:

__1. Types are defined:__

A user defines the type of data that will be loaded from the server:

@sourceref ./examples/todo-union-example.js
@codepen
@highlight 3-10,only

__2. The defined type exposes a schema:__

[can-define/map/map]s expose this type information as a schema:

@sourceref ./examples/todo-union-example.js
@codepen
@highlight 12,only

__3. The schema is used by `can-query-logic` to create set instances:__

When a call to `.filter()` happens like:

@sourceref ./examples/todo-union-example.js
@codepen
@highlight 14-17,only

The queries (ex: `{ filter: {name: "assigned"} }`) are hydrated to `SetType`s like:

```js
const assignedSet = new BasicQuery({
  filter: new And({
    name: new Status[Symbol.for("can.SetType")]("assigned")
  })
});
```

> NOTE: __hydrated__ is the opposite of serialization. It means we take
> a plain JavaScript object like `{ filter: {name: "assigned"} }` and
> create instances of types with it.

The following is a more complex query and what it gets hydrated to:


```js
import {canReflect, QueryLogic} from "can";
//query
const queryLogic = new QueryLogic({
  filter: {
    age: {$gt: 22}
  },
  sort: "-name",
  page: {start: 0, end: 9}
});

console.log( canReflect.getSchema(queryLogic) ); //-> {
//   filter: {
//     age: {$gt: 22}
//   },
//   sort: "-name",
//   page: {start: 0, end: 9}
// }
```
@codepen

```js
// hydrated set types
new BasicQuery({
  filter: new And({
    age: new GreaterThan(22)
  }),
  sort: "-name",
  page: new RealNumberRangeInclusive(0,9)
});
```
<!-- can has no export by the name of BasicQuery -->

Once queries are hydrated, `can-query/src/set` is used to perform the union:

```js
set.union(assignedSet, completeSet);
```

`set.union` looks for comparator functions specified on their constructor's
`can.setComparisons` symbol property.  For example, `BasicQuery` has
a `can.setComparisons` property and value like the following:

```js
import {BasicQuery} from "can";

BasicQuery[Symbol.for("can.setComparisons")] = new Map([
  [BasicQuery]: new Map([
    [BasicQuery]: {union, difference, intersection}
    [QueryLogic.UNIVERSAL]: {difference}
  ])
]);
```
<!-- can has no export by the name of BasicQuery -->

Types like `BasicQuery` and `And` are "composer" types.  Their
 `union`, `difference` and `intersection` methods perform
 `union`, `difference` and `intersection` on their children types.

`can-query-logic`s methods reflect [set theory](https://en.wikipedia.org/wiki/Set_theory)
 operations.  That's why most types need a `union`, `intersection`, and `difference`
 method.  With that, other methods like `isEqual` and `isSubset` can be derived.

In this case, `set.union` will call `BasicQuery`'s union with
itself.  This will see that the `sort` and `page` results match
and simply return a new `BasicQuery` with the union of the filters:

```js
new BasicQuery({
  filter: set.union( assignedSet.filter, completeSet.filter )
})
```

This will eventually result in a query like:

```js
new BasicQuery({
  filter: new And({
    name: new Status[Symbol.for("can.SetType")]("assigned", "complete")
  })
})
```

__4. The resulting query is serialized:__

Finally, this set will be serialized to:

```js
{
  filter: {
    name: ["assigned", "complete"]
  }
}
```

The serialized output above is what is returned as a result of the union.


### Code Organization

On a high level, `can-query-logic` is organized in four places:

- `src/set.js` - The core "set logic" functionality. For example `set.isEqual`
  is built to derive from using underlying `difference` and `intersection` operators.
- `src/types/*` - These are the `SetType` constructors used to make comparisons between
  different sets or properties.
- `src/serializers/*` - These provide hydration and serialization methods used to
  change the plain JavaScript query objects to `SetType`s and back to plain JavaScript
  query objects.
- `can-query-logic.js` - Assembles all the different types and serializers to
  hydrate  a query object to a SetType instance, then uses `set.js`'s logic to
  perform the set logic and serialize the result.
