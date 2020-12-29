@module {{}} can-set-legacy
@parent can-data-modeling
@collection can-legacy
@group can-set-legacy.types types
@group can-set-legacy.properties properties
@package ../package.json

@description

`can-set-legacy` supports a legacy `can-set` API that creates a [can-query-logic] instance.

@type {Object}

Once you've imported the `can-set-legacy` module into your project, use it to create a `set.Algebra` and then use that to compare and perform operations on sets.  

```js
import set from "can-set-legacy";

// create an algebra
const algebra = new set.Algebra(

	// specify the unique identifier on data
	set.props.id( "_id" ),

	// specify that completed can be true, false or undefined
	set.props.boolean( "completed" ),

	// specify properties that define pagination
	set.props.rangeInclusive( "start", "end" ),

	// specify the property that controls sorting
	set.props.sort( "orderBy" ),
);

// compare two sets
algebra.subset( { start: 2, end: 3 }, { start: 1, end: 4 } ); //-> true
algebra.difference( {}, { completed: true } ); //-> {completed: false}

// perform operations on sets
algebra.getSubset( { start: 2, end: 3 }, { start: 1, end: 4 },
	[ { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 } ] );

//-> [{id: 2},{id: 3}]
```

@body

## Legacy Use

Use `can-set-legacy` as a replacement for CanJS 3.0 and 4.0's `can-set` package.  In CanJS 3.0 and 4.0, one created
an [can-set-legacy.Algebra] to customize how requests were made and passed that to [can-connect] like:

```js
import set from "can-set";
import connect from "can-connect";
import constructor from "can-connect/constructor/constructor";
import dataUrl from "can-connect/data/url/url";
import connectMap from "can-connect/can/map/map";

var todoAlgebra = new set.Algebra(
  set.props.boolean("complete"),
  set.props.id("_id")
);

const todoConnection = connect( [
	connectMap
	constructor,
	connectMap
], {
	cacheConnection: cacheConnection,
	url: "/todos",
	algebra: todoAlgebra
});
```

In CanJS 5.0, [can-query-logic] has replaced `can-set`.  However, you can still use `can-set-legacy`
to configure a `queryLogic` instance with the same configuration API as the old `can-set`. In 5.0, you can write:

```js
import set from "can-set-legacy";
import connect from "can-connect";
import constructor from "can-connect/constructor/constructor";
import dataUrl from "can-connect/data/url/url";
import connectMap from "can-connect/can/map/map";

var todoQueryLogic = new set.Algebra(
  set.props.boolean("complete"),
  set.props.id("_id")
);

const todoConnection = connect( [
	connectMap
	constructor,
	connectMap
], {
	cacheConnection: cacheConnection,
	url: "/todos",
	queryLogic: queryLogic
});
```


The following `queryLogic` instance returned by `new set.Algebra` created with `can-set-legacy`:

```js
import set from "can-set-legacy";

var todoQueryLogic = new set.Algebra(
  set.props.boolean("complete"),
  set.props.id("_id")
);
```

... is nearly identical to the behavior of the 3.0 and 4.0's `can-set`. The major difference is that
it's `union`, `intersection`, and `difference` methods will return:

- [can-query-logic.EMPTY] instead of `false`
- [can-query-logic.UNDEFINABLE] instead of `true`
- [can-query-logic.UNKNOWABLE] instead of `undefined`

For example:

```js
todoQueryLogic.difference({
	foo: "bar"
}, {
	foo: "bar"
}) //-> QueryLogic.EMPTY
```

## Use

A [can-set-legacy/Set] is a plain JavaScript object used to represent a
[https://en.wikipedia.org/wiki/Set_theory#Basic_concepts_and_notation set] of data usually sent to the server to fetch a list of records.  For example,
a list of all completed todos might be represented by:

```js
{complete: true}
```

This set might be passed to [can-connect/can/map/map.getList] like:

```js
Todo.getList({complete: true})
```

An [can-set-legacy.Algebra] is used to detail the behavior of these sets,
often using already provided [can-set-legacy.props] comparators:

```js
var todoAlgebra = new set.Algebra(
  set.props.boolean("complete"),
  set.props.id("_id")
);
```

Using an algebra, all sorts of special behaviors can be performed. For
example, if we already loaded the incomplete todos (`{complete: false}`) and
wanted to load all todos (`{}`), we could use a set [can-set-legacy.Algebra.prototype.difference] to figure out how to load
only the data that hasn't been loaded.

```js
todoAlgebra.difference( {}, { complete: false } ); //-> {complete: true}
```

These algebra's are typically used by either [can-connect] or
[can-fixture] to provide these special behaviors:

```js
const cacheConnection = connect( [
	require( "can-connect/data/memory-cache/memory-cache" )
], {
	algebra: todoAlgebra
} );

const todoConnection = connect( [
	require( "can-connect/data/url/url" ),
	require( "can-connect/cache-requests/cache-requests" )
], {
	cacheConnection: cacheConnection,
	url: "/todos",
	queryLogic: todoAlgebra
} );
```

```js
const todoStore = fixture.store( [
	{ _id: 1, name: "Do the dishes", complete: true },
	{ _id: 2, name: "Walk the dog", complete: false }
],
queryLogic );

fixture( "/todos/{_id}", todoStore );
```

The best way to think about `can-set-legacy` is that its a way to detail
the behavior of your service layer so other utilities can benefit.

## Solving Common Issues

Configuring the proper `set.Algebra` can be tricky.  The best way to make sure you
have things working is to create an algebra and make sure some of the basics
work.  

The most common problem is that your `algebra` isn't configured to know what
instance data belongs in which set.  

For example, `{id: 1, name: "do dishes"}` should belong to the
set `{sort: "name asc"}`, but it doesn't:

```js
const algebra = new set.Algebra();
algebra.has( { sort: "name asc" }, { id: 1, name: "do dishes" } ); //-> false
```

The fix is to either ignore `sort` like:

```js
const algebra = new set.Algebra( {
	sort: function() {
		return true;
	}
} );
algebra.has( { sort: "name asc" }, { id: 1, name: "do dishes" } ); //-> false
```

Or even better, make `sort` actually able to understand sorting:

```js
const algebra = new set.Algebra(
	set.props.sort( "sort" )
);
algebra.has( { sort: "name asc" }, { id: 1, name: "do dishes" } ); //-> true
```

Similarly, you can verify that [can-set-legacy.Algebra.prototype.getSubset]
works.  The following, with a default algebra gives
the wrong results:

```js
const algebra = new set.Algebra();
algebra.getSubset(
	{ offset: 1, limit: 2 },
	{},
	[
		{ id: 1, name: "do dishes" },
		{ id: 2, name: "mow lawn" },
		{ id: 3, name: "trash" }
	]
); //-> []
```

This is because it's looking for instance data where `offset===1` and `limit===2`.
Again, you can teach your algebra what to do with these properties like:

```js
const algebra = new set.Algebra(
	set.props.offsetLimit( "offset", "limit" )
);
algebra.getSubset(
	{ offset: 1, limit: 2 },
	{},
	[
		{ id: 1, name: "do dishes" },
		{ id: 2, name: "mow lawn" },
		{ id: 3, name: "trash" }
	]
); //-> [
//  {id: 2, name: "mow lawn"},
// {id: 3, name: "trash"}
// ]
```
