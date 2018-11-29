@page migrate-5 Migrating to CanJS 5
@parent guides/upgrade 2
@templateRender <% %>
@description This guide walks you through the process to upgrade a 4.x app to CanJS 5.x.
@outline 2
@body


## Why Upgrade

CanJS 5.0:

- Is easy to upgrade to! Only the model layer has breaking changes and there's a [can-set-legacy compatibility api] that
  eliminates most breaking changes.
- Supports named exports from the "can" package!  The following is a "hello world":
  ```js
  import {Component} from "can";
  Component.extend({
    tag: "hello-world",
    view: `{{message}} World!`,
    ViewModel: {  message: {default: "Hello"} }
  });
  ```
- Simplifies the model layer!
  - Use nicely documented, pre-built models for common scenarios:
    - [can-rest-model] - A simple restful connection without the need to configure a [can-query-logic].
    - [can-realtime-rest-model] - A simple restful connection with automatic list management.
    - [can-super-model] - A restful connection with most of [can-connect]’s features already configured.
  - More easily configure [can-query-logic].  If your service layer matches [can-query-logic]’s expectations,
    all configuration comes from your [can-define/map/map DefineMap].  The following defines a `Todo`
    type and connects it to a restful service. No need to create a `new set.Algebra()`!

    ```js
    import {DefineMap, DefineList, realtimeRestModel} from "can";

    const Todo = DefineMap.extend({
        // Configures `id` as the unique property.
        id: {identity: true, type: "number"},

        // Configures `name` as allowing null, undefined, or string values
        name: "string",

        // Configures `complete` as allowing true, false, null, or undefined
        complete: "boolean",

        // Configures `dueDate` as allowing null, undefined, or date values
        // Also will support queries like:
        // {filter: {dueDate: {$gt: "Thu Jun 07 2018 10:00:00 GMT-0500 (CDT)"}}}
        dueDate: "date"
    });

    Todo.List = DefineList.extend({"#": Todo})

    realtimeRestModel({
        Map: Todo,
        url: "/todos/{id}"
    })
    ```
  - Automatic list management (also known as [can-connect/real-time/real-time]) and [can-fixture] support
    [can-query-logic/comparison-operators MongoDB-style comparison operators] like `$in`, `$ne`, `$lte`, etc.
    The following shows simulating
    a service that supports filtering with _MongoDB-style comparison operators_ and makes a request
    for todos using those _comparison operators_:

    ```js
    import {fixture} from "can-fixture";

    const todoStore = fixture.store([
        { id: 1, name: "Do the dishes", complete: true, dueDate: "2018-06-01" },
        { id: 2, name: "Walk the dog", complete: false, dueDate: "2018-06-28" } ], Todo);

    fixture("/todos/{id}", todoStore);

    // Request todos after June 7th
    Todo.getList({
        filter: {
            dueDate: { $gt: "Thu Jun 07 2018 10:00:00 GMT-0500 (CDT)" }
        }
    }).then(function(todos){
        // Only receive todos after June 7th
        todos //-> Todo.List[ Todo{id: 2, ...} ]
    })
    ```
  - If your service layer does not match [can-query-logic]’s expectations,
    it’s far easier to configure than [can-set-legacy can-set]. For example, if
    your service layer uses `orderBy` instead of `sort`, you just need to provide functions that
    translate back and forth between your servers parameters and `can-query-logic`’s [can-query-logic/query query format].

    ```js
    import {DefineMap, DefineList, realtimeRestModel, QueryLogic} from "can";

    const Todo = DefineMap.extend({
        // Configures `id` as the unique property.
        id: {identity: true, type: "number"},

        // Configures `name` as allowing null, undefined, or string values
        name: "string",

        // Configures `complete` as allowing true, false, null, or undefined
        complete: "boolean",

        // Configures `dueDate` as allowing null, undefined, or date values
        // Also will support queries like:
        // {filter: {dueDate: {$gt: "Thu Jun 07 2018 10:00:00 GMT-0500 (CDT)"}}}
        dueDate: "date"
    });

    Todo.List = DefineList.extend({"#": Todo});

    const todoQueryLogic = new QueryLogic(Todo,{
        toQuery(params){
            let query = {...params};
            if(query.orderBy != null) {
                query.sort = query.orderBy;
                delete query.orderBy;
            }
            return query;
        },
        toParams(query){
            let params = {...query};
            if(params.orderBy != null) {
                params.sort = params.orderBy;
                delete params.orderBy;
            }
            return params;
        }
    });

    realtimeRestModel({
        Map: Todo,
        url: "/todos/{id}",
        queryLogic: todoQueryLogic
    })
    ```
    There's [can-query-logic#Configuration detailed documentation] on how
    to configure a `new QueryLogic()` for any circumstances.
    @highlight 21-38,43,only


## Breaking Changes

The following is a list of changes you must make to use CanJS 5.0.

### Replace `can-set` with `can-set-legacy`

The biggest change to CanJS 5.0 from 4.0 was the replacement of `can-set` with
[can-query-logic].  If you are using `can-set`, it’s likely you can upgrade by using [can-set-legacy]
instead of `can-set`. So if you had code like:

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

If you'd like to upgrade to avoid using `can-set-legacy`, the above code could be replaced with the [can-query-logic] equivalent:

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

let todoQueryLogic = new QueryLogic(Todo,{
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

> NOTE: If the service layer can be re-written to match [can-query-logic]’s
> format, configuring a `queryLogic` instance isn't necessary.  Read
> more about this format in [can-rest-model]’s documentation.

### Create a list type on all connections

Previously, [can-connect/can/map/map can-connect/can/map/map] would create a default list type for connections
if one was not supplied. For example, the following only provides a `Map` setting, but a `List` is created:

```js
import connect from "can-connect";
import dataUrl from "can-connect/data/url/url";
import constructor from "can-connect/constructor/constructor";
import canMap from "can-connect/can/map/map";
import DefineMap from "can-define/map/map";

const Todo = DefineMap.extend({
    id: "number",
    ...
});

const todoConnection = connect( [ dataUrl, constructor, canMap ], {
    Map: Todo,
    url: "/services/todos"
});

todoConnection.List //-> DefineList
```

In CanJS 5.0, you must provide a `List` type yourself:

```js
import connect from "can-connect";
import dataUrl from "can-connect/data/url/url";
import constructor from "can-connect/constructor/constructor";
import canMap from "can-connect/can/map/map";
import DefineMap from "can-define/map/map";
import DefineList from "can-define/list/list";

const Todo = DefineMap.extend({
    id: "number",
    ...
});
const TodoList = DefineList.extend({
    "#": Todo
});

const todoConnection = connect( [ dataUrl, constructor, canMap ], {
    Map: Todo,
    List: TodoList,
    url: "/services/todos"
});
```
@highlight 12-14,18

The `List` type can also be on the `Map`:

```js
import connect from "can-connect";
import dataUrl from "can-connect/data/url/url";
import constructor from "can-connect/constructor/constructor";
import canMap from "can-connect/can/map/map";
import DefineMap from "can-define/map/map";
import DefineList from "can-define/list/list";

const Todo = DefineMap.extend({
    id: "number",
    ...
});
Todo.List = DefineList.extend({
    "#": Todo
});

const todoConnection = connect( [ dataUrl, constructor, canMap ], {
    Map: Todo,
    url: "/services/todos"
});
```
@highlight 12-14,17-18

All model types, for example [can-rest-model] and [can-realtime-rest-model], must also be passed a `List` type.

### Create, update, and delete requests must return all properties or set `updateInstanceWithAssignDeep` to true

In 4.0, [can-connect/can/map/map can-connect/can/map/map] performed __assignment__ with the data returned
from the server. For example, if a todo was created as follows:

```js
const todo = new Todo({
    name: "laundry",
    complete: false
}).save();
```

If the server returned the following JSON (_note_ the missing `complete` property):

```js
{
    id: 5, name: "Laundry"
}
```

The todo would have the following properties:

```js
todo //-> Todo{id: 5, name: "Laundry", complete: false}
```

In 4.0, the response value was "assigned" to the instance. Missing properties were __not__ deleted.

In __5.0__, the response is __merged__ into the instance.  Missing properties __will__ be deleted. This means that
in 5.0, the above response would delete the `complete` property, resulting in a todo like:

```js
todo //-> Todo{id: 5, name: "Laundry"}
```

> NOTE: The 5.0 __merge__ behavior is quite powerful when dealing with nested data.  You can read more about the
behavior on its documentation page: [can-diff/merge-deep/merge-deep].

The solution is to either change your services to return all properties or set your connection's [can-connect/can/map/map.updateInstanceWithAssignDeep] property to `true`:

```js
import connect from "can-connect";
import dataUrl from "can-connect/data/url/url";
import constructor from "can-connect/constructor/constructor";
import canMap from "can-connect/can/map/map";
import DefineMap from "can-define/map/map";
import DefineList from "can-define/list/list";

const Todo = DefineMap.extend({
    id: "number",
    ...
});
Todo.List = DefineList.extend({
    "#": Todo
});

const todoConnection = connect( [ dataUrl, constructor, canMap ], {
    Map: Todo,
    url: "/services/todos",
    updateInstanceWithAssignDeep: true
});
```
@highlight 19

### Replace `idProp` configuration with an `identity` configuration

In 4.0, it was possible to configure your the property that defined your identity with an `idProp`. For example,
the following uses it to specify the `idProp` as `_id`:

```js
import connect from "can-connect";
import dataUrl from "can-connect/data/url/url";
import constructor from "can-connect/constructor/constructor";
import canMap from "can-connect/can/map/map";
import DefineMap from "can-define/map/map";
import DefineList from "can-define/list/list";

const Todo = DefineMap.extend({
    _id: "number",
    ...
});
Todo.List = DefineList.extend({
    "#": Todo
});

const todoConnection = connect( [ dataUrl, constructor, canMap ], {
    Map: Todo,
    url: "/services/todos",
    idProp: "_id"
});
```
@highlight 19

`idProp` is no longer supported.

In 5.0, there are multiple ways to configure the identity property. The `identity` property comes
from the [can-query-logic] created by or passed to the `todoConnection`. For example, you can specify the
`identity` properties on the __schema__ passed to `new QueryLogic(schema)`:

```js
const Todo = DefineMap.extend({
    _id: "number",
    ...
});
Todo.List = DefineList.extend({
    "#": Todo
});

const todoConnection = connect( [ dataUrl, constructor, canMap ], {
    Map: Todo,
    url: "/services/todos",
    queryLogic: new QueryLogic({
        identity: ["_id"]
    })
});
```
@highlight 12-14

__Schemas__ are available on `DefineMap`s.  So you could also use the [can-define.types.identity] property
behavior to specify that `_id` is the identity property:


```js
const Todo = DefineMap.extend({
    _id: {type: "number", identity: true}
    ...
});
Todo.List = DefineList.extend({
    "#": Todo
});

const todoConnection = connect( [ dataUrl, constructor, canMap ], {
    Map: Todo,
    url: "/services/todos",
    queryLogic: new QueryLogic(Todo)
});
```
@highlight 2,12

Finally, if `queryLogic` is only being configured by the same type that is being passed as `Map`,
no `queryLogic` is needed as this will happen by default.  The following is equivalent to the previous example:

```js
const Todo = DefineMap.extend({
    _id: {type: "number", identity: true}
    ...
});
Todo.List = DefineList.extend({
    "#": Todo
});

const todoConnection = connect( [ dataUrl, constructor, canMap ], {
    Map: Todo,
    url: "/services/todos"
});
```

### Replace __listSet with with the can.listQuery symbol

In CanJS 4.0, the default [can-connect/base/base.listQueryProp] was `__listSet`.  It is now
a `can.listQuery` symbol.  If you were setting `__listSet` on an List like the following:

```js
const ClassRoom = DefineMap.extend({
    ...
    students: {
        type: Student.List
        set(students) {
            students.__listSet = {filter: {classRoomId: this._id}}
            return students;
        }
    }
})
```

You should do it as follows:

```js
const ClassRoom = DefineMap.extend({
    ...
    students: {
        type: Student.List
        set(students) {
            students[Symbol.for("can.listQuery")] = {filter: {classRoomId: this._id}}
            return students;
        }
    }
})
```

> NOTE: use [can-symbol] if you want IE11 support.

### Set urlData when using can-route-pushstate

In `can-route-pushstate` 4.X it would automatically register itself as the default binding with `can-route`. In order to reduce the amount of side-effectual packages CanJS has, we changed this in can-route-pushstate 5.0 so that you must explicitly register it.

 To do this you need to:

- import the `RoutePushstate` constructor function.
- Create a new instance.
- Set it to the `route.urlData` property.

```js
import RoutePushstate from 'can-route-pushstate';
import route from 'can-route';

route.urlData = new RoutePushstate();
route.register('{page}', { page: 'home' });
route.start();
```
@highlight 4

### Don’t parse error responses with can-ajax

This is a common pattern with [can-ajax] 1:

```js
import ajax from 'can-ajax';

ajax().then(function() {
    // Handle a successful response…
}, function(xhr) {
    const error = JSON.parse(xhr.responseText);
    // Do something with error…
});
```
@highlight 5-6

With [can-ajax] 2, you no longer need to parse the `responseText`:

```js
import ajax from 'can-ajax';

ajax().then(function() {
    // Handle a successful response…
}, function(error) {
    // Do something with error…
});
```
@highlight 5

## Recommended Changes

The following are suggested changes to make sure your application is compatible beyond 5.0.

### Use new models instead of old models

`can-connect` 2.X had some pre-configured modules that created a connection of
multiple behaviors:

- [can-connect/can/base-map/base-map]
- `can-connect/can/super-map/super-map`

These have been moved into their own packages:

- [can-realtime-rest-model]
- [can-super-model]

### Replace `can-set-legacy` with `can-query-logic`

Instead of using [can-set-legacy], use [can-query-logic] directly to configure
your query behavior. Read through the documentation on how to customize can-query-logic's documentation
[can-query-logic#Configuration here].

In short:

- set.props.[can-set-legacy.props.id] is replaced by the [can-define.types.identity] property behavior on a DefineMap.
- set.props.[can-set-legacy.props.boolean] is replaced by `{type: "boolean"}` on a DefineMap.
- set.props.[can-set-legacy.props.enum] is replaced by [can-query-logic.makeEnum].
- [can-set-legacy.props.offsetLimit], [can-set-legacy.props.rangeInclusive], and [can-set-legacy.props.sort]
  are replaced by `options.toQuery` and `options.toParams` values passed to [can-query-logic].

So instead of:

```js
const todoAlgebra = new set.Algebra(

    // specify the unique identifier on data
    set.props.id( "_id" ),

    // specify that completed can be true, false or undefined
    set.props.boolean( "completed" ),

    set.props.enum("status",["new","assigned","complete"])

    // specify properties that define pagination
    set.props.offsetLimit( "offset", "limit" ),

    // specify the property that controls sorting
    set.props.sort( "orderBy" ),
);
```

You would have:

```js
const Todo = DefineMap.extend({
    _id: {type: "string", identity: true},
    complete: {type: "boolean"},
    status: QueryLogic.makeEnum(["new","assigned","complete"])
});

const todoQueryLogic = new QueryLogic(Todo,{
    toQuery(params){
        let query = {...params};
        if(query.orderBy != null) {
            query.sort = query.orderBy;
            delete query.orderBy;
        }
        if(("offset" in query) || ("limit" in query)) {
            query.page = {};
        }
        if("offset" in query) {
            query.page.start = query.offset;
            delete query.offset;
        }
        if("limit" in query) {
            query.page.end = (query.page.start || 0 ) + query.limit - 1;
            delete query.limit;
        }
        return query;
    },
    toParams(query){
        let params = {...query};
        if(params.orderBy != null) {
            params.sort = params.orderBy;
            delete params.orderBy;
        }
        if(params.page) {
            params.offset = params.page.start;
            params.limit = (params.page.end - params.page.start) + 1;
            delete params.page;
        }
        return params;
    }
})
```

### Space out your stache

We've begun formatting our [can-stache] templates as follows:

```html
{{# if(app.session) }}
	{{# if(app.session.isAdmin) }}
		<li {{# is(app.page, 'users') }}class='active'{{/ is }}>
			<a href="{{ routeUrl(page='users') }}">Users</a>
		</li>
	{{/ if }}
	<li {{# is(app.page, 'account') }}class='active'{{/ is }}>
		<a href="{{ routeUrl(page='account') }}">Account</a>
	</li>
	<li>
		<a href="javascript://" on:click="scope.vm.logout()">Logout</a>
	</li>
{{ else }}

{{/ if }}
```

The following regular expressions and substitutions can be useful to clean
up your stache code:

- `\{\{([^ #\/])` => `{{ $1` - Replaces `{{foo` with `{{ foo`.
- `\{\{([#\/\^])([^ ])` => `{{$1 $2` - Replaces `{{#foo` with `{{# foo`.
- `([^ ])\}\}` => `$1 }}` - Replaces `foo}}` with `foo }}`.

Also, the following regular expression can help you find helper expressions like: `{{ foo bar }}` and
update them to call expressions like `{{ foo(bar) }}`:

- `\{\{\s*([#\/\^])\s*\w+\s+[\w\.]+`

### Use for(of), let, and this

In short, CanJS is migrating away from "context" lookup and to variable
lookup. This section talks about what this means and how to migrate your code.

[can-stache] was originally based off [Mustache](http://mustache.github.io/) and [Handlebars](http://handlebarsjs.com/).  As CanJS evolved, we recognized that their
implicit scope walking was a source of numerous bugs. For example, the following
might look up `name` on a `todo` or on the `ViewModel`:

```js
Component.extend({
	view: `
		{{#each todosPromise.value}}
			<li on:click="edit(this)">{{name}}</li>
		{{/each}}
	`,
	ViewModel: {
		get todosPromise(){ return Todo.getList(); },
		name: { type: "string", default: "ViewModel" },
		edit(todo) { ... }
	}
})
```

For CanJS 4.0, we made scope walking explicit.  If `edit` should be read on the
`ViewModel`, it must be looked up with `../` as follows:

```js
Component.extend({
	view: `
		{{#each todosPromise.value}}
			<li on:click="../edit(this)">{{name}}</li>
		{{/each}}
	`,
	ViewModel: {
		get todosPromise(){ return Todo.getList(); },
		name: { type: "string", default: "ViewModel" },
		edit(todo) { ... }
	}
})
```

While this explicitness prevents errors, it confusing to users. In fact,
context-based lookup is confusing to users altogether.  Values seem to come from
nowhere. It works more like JavaScript's [with](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/with). Instead,
we are migrating towards a variable-based lookup approach. Thus, we've:

- Created two new helpers ([can-stache.helpers.for-of] and [can-stache.helpers.let]) that
  create variables.
- Started using `{{this.key}}` to refer to values on the ViewModel instead of `{{key}}`.

The component above should be updated to:

```js
Component.extend({
	view: `
		{{# for todo of this.todosPromise.value }}
			<li on:click="this.edit(todo)">{{ todo.name }}</li>
		{{/ for }}
	`,
	ViewModel: {
		get todosPromise(){ return Todo.getList(); },
		name: { type: "string", default: "ViewModel" },
		edit(todo) { ... }
	}
})
```

Notice that `this` remains the `ViewModel` because [can-stache.helpers.for-of] doesn't
change the context, it only creates a `todo` variable.  Writing stache templates like this
makes what's going on immediately clear.
