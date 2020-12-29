@function can-set-legacy.Algebra Algebra
@parent can-set-legacy.properties
@group can-set-legacy.Algebra.prototype prototype

@description Perform set logic with an awareness of
how certain properties represent a set.


@signature `new set.Algebra(compares...)`

An `algebra` instance can perform a variety of set logic methods
using the `compares` configuration.

A default `algebra` instance can be created like:

```js
import set from "can-set-legacy";
const defaultAlgebra = new set.Algebra();
```

This treats every property as a filter in a `where` clause.  For example:

```js
// `{id: 2, ownerId: 5}` belongs to ``.getList({ownerId: 5})`
defaultAlgebra.has( { ownerId: 5 }, { id: 2, ownerId: 5 } ); //-> true

defaultAlgebra.getSubset( { ownerId: 5 }, {},
	[
		{ id: 1, ownerId: 2 },
		{ id: 2, ownerId: 5 },
		{ id: 3, ownerId: 12 }
	] ); //-> [{id: 2, ownerId: 5}]
```

[can-set-legacy.compares] configurations can be passed to
add better property behavior awareness:


```js
import set from "can-set-legacy";
const todoAlgebra = new set.Algebra(
	set.props.boolean( "completed" ),
	set.props.id( "_id" ),
	set.props.offsetLimit( "offset", "limit" )
);

defaultAlgebra.getSubset( { limit: 2, offset: 1 }, {},
	[
		{ id: 1, ownerId: 2 },
		{ id: 2, ownerId: 5 },
		{ id: 3, ownerId: 12 }
	] ); //-> [{id: 2, ownerId: 5},{id: 3, ownerId: 12}]
```

[can-set-legacy.props] has helper functions that make common [can-set-legacy.compares]
configurations.

  @param {can-set-legacy.compares} compares Each argument is a compares. These
  are returned by the functions on [can-set-legacy.props] or can be created
  manually.

  @return {can-set-legacy.Algebra} Returns an instance of an algebra.
