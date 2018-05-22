@page migrate-5 Migrating to CanJS 5
@parent guides/upgrade 2
@templateRender <% %>
@description This guide walks you through the step-by-step process to upgrade a 4.x app to CanJS 5.
@outline 1
@body


## Why Upgrade

CanJS 5.0:

- Simplifies the model layer:
  - [can-query-logic] has a number of improvements from `can-set`:
    - Less configuration
    - Easier to configure custom comparisons
    - Supports MongoDB style operators: `$gt`, `$lte`, etc
  - Has pre-built models: [can-rest-model], [can-realtime-rest-model], [can-super-model]
- Supports named exports from "can" package
- Is easy to upgrade to! Only the model layer has breaking changes and we've created  
  a good compatibility layer.



## can-set -> can-set-legacy

The biggest change to CanJS 5.0 from 4.0 was the replacement of `can-set` with
[can-query-logic].  If you are using [can-set], it's likely you can upgrade by using [can-set-legacy]
instead of [can-set]. So if you had code like:

```js
import set from "can-set";
import DefineMap from "can-define/map/map";
import superMap from "can-connect/can/super-map/super-map";

const Todo = DefineMap.extend({ ... });

todoAlgebra = new set.Algebra(
    set.props.id("_id"),
    set.props.enum("status",["new","pending","resolved"]),
    set.props.boolean("complete")
);

superMap({
    Map: Todo,
    algebra: todoAlgebra,
    ...
})
```

You can simply use [can-set-legacy] instead like:

```js
import set from "can-set-legacy";
import DefineMap from "can-define/map/map";
import DefineList from "can-define/list/list";
import superMap from "can-connect/can/super-map/super-map";

const Todo = DefineMap.extend({ ... });
Todo.List = DefineList.extend({"#": Todo, ...});

todoAlgebra = new set.Algebra(
    set.props.id("_id"),
    set.props.enum("status",["new","pending","resolved"]),
    set.props.boolean("complete")
);

superMap({
    Map: Todo,
    algebra: todoAlgebra,
    ...
})
```

[can-set-legacy] is highly compatible with `can-set`.  It returns an
instance of [can-query-logic] so it is not perfectly compatible, but it should
be enough for the vast majority of applications to upgrade without problems.

If you'd like to upgrade to avoid using `can-set-legacy`, the above code could be replaced with:

```js
import DefineMap from "can-define/map/map";
import superModel from "can-super-model";
import QueryLogic from "can-query-logic";

const Todo = DefineMap.extend({
    _id: {identity: true, type: "number"},
    name: "string",
    complete: QueryLogic.makeEnum([true, false]),
    status: QueryLogic.makeEnum(["new","pending","resolved"])
});
Todo.List = DefineList.extend({"#": Todo, ...});

var todoQueryLogic = new QueryLogic(Todo,{
    toQuery(params){
        return {filter: params};
    },
    toParams(query){
        return query.filter;
    }
})

superModel({
    Map: Todo,
    queryLogic: todoQueryLogic,
    ...
})
```

> NOTE: If the service layer can be re-written to match [can-query-logic]'s
> format, configuring a `queryLogic` instance isn't necessary.  Read
> more about this format in [can-rest-model]'s documentation.

## can-connect changes

[can-connect] requires a `queryLogic` or `algebra` property. `idProp` configuration is no longer supported. So if you had code like:

```js
connect([...],{
    idProp: "_id"
});
```

You need to change the `idProp` configuration to be part of your `queryLogic`:

```js
import QueryLogic from "can-query-logic";

var queryLogic = new QueryLogic({
    identity: ["_id"]
});

connect([...],{
    queryLogic: queryLogic
});
```

### 

### Model methods

`can-connect` 2.X had some pre-configured modules that created a connection of
multiple behaviors:

- `can-connect/can/base-map/base-map`
- `can-connect/can/super-map/super-map`

These have been moved into their own packages:

- `can-realtime-rest-model`
- `can-super-model`
