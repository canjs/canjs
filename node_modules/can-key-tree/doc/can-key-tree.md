@module {function} can-key-tree
@parent can-js-utilities
@collection can-infrastructure
@group can-key-tree.types 0 types
@group can-key-tree.prototype 1 prototype
@package ../package.json

@description Store values in a tree structure.

@signature `new KeyTree(treeStructure [, callbacks])`

Create a tree instance that stores values on nodes of instances of the types
specified in `treeStructure`.  For example, the following
creates a keyTree whose root node will be an Object and child nodes will
be Arrays:

```js
const cities = new KeyTree( [ Object, Array ] );
```

Once you've created a `keyTree`, you can [can-key-tree.prototype.add],
[can-key-tree.prototype.delete] and [can-key-tree.prototype.get] values
from it. The following `"Chicago"` to the tree:

```js
cities.add( [ "Illinois", "Chicago" ] );
```

Internally, `cities` structure looks like:

```js
{
	"Illinois": [ "Chicago" ]
}
```

@param {Array<function>} treeStructure An array of constructor functions. An instance of each type will be used
  as the nodes of the tree. All of the types except the last should be [can-reflect.isMapLike map-like].
  The last type should be [can-reflect.isListLike]. For example:

  ```js
new KeyTree( [ Object, Map, Array ] );   // OK
new KeyTree( [ Object, Set ] );          // OK
new KeyTree( [ Object, Array, Array ] ); // WRONG
new KeyTree( [ Array, Object ] );        // WRONG
```

  Instances of the types are created with `new Type()` for built-in types like Array and Object. User
  defined types are created with `new Type(parentKey)` where parentKey is the name of the key of the parent
  node that points to the node being created.

  [can-reflect] is used to access and manipulate each type, allowing rich behaviors as demonstrated in
  the [Advanced Use](#AdvancedUse) below.  The following lists the reflections used by `can-key-tree`:

  - [can-reflect.getKeyValue] - to follow a branch from one node to its child node
  - [can-reflect.setKeyValue] - to create a branch from one node to a child node
  - [can-reflect.deleteKeyValue] - to delete a branch from one node to a child node
  - [can-reflect/shape.size] - to return the number of child nodes
  - [can-reflect/shape.each] - to recursively get child nodes.
  - addValues - to add values to the leaf list-like nodes.
  - removeValues - to remove values from the leaf list-like nodes.
  - [can-reflect.isMoreListLikeThanMapLike] - to know if the last node type is list-like or not.

@param {can-key-tree.types.keyTreeCallbacks} [callbacks] An object containing callbacks `onFirst` and/or `onEmpty`.
@return {can-key-tree} An instance of `KeyTree`.

@body

## Use Cases

`can-key-tree` can be used for a wide variety of purposes.  In CanJS, it is used extensively for
storing event handlers organized by key and [can-queues event queue].  Its use of [can-reflect]
means it can simplify complex patterns such as implementing event delegation as shown in the [Advanced Use](#AdvancedUse)
section below.

When you are adding, removing, and retrieving items from a nested structure, `can-key-tree` can likely help.

## Use

Import the `KeyTree` constructor from `can-key-tree`:

```js
import KeyTree from  "can-key-tree";
```

Create an instance of `KeyTree` with an array of types.  An instance of each type
will be used as the nodes of the tree. The following creates a tree structure
3 levels deep:


```js
const keyTree = new KeyTree( [ Object, Object, Array ], { onFirst, onEmpty } );
```

Once you've created a `keyTree`, you can `.add`, `.delete` and `.get` values from
it.

#### .add(keys)

The following adds three `handlers`:

```js
function handler1() {}
function handler2() {}
function handler3() {}

keyTree.add( [ "click", "li", handler1 ] );
keyTree.add( [ "click", "li", handler2 ] );
keyTree.add( [ "click", "span", handler3 ] );
```

The `keyTree` data structure will look like:

```js
{
	"click": {
		"li": [ handler1, handler2 ],
		"span": [ handler3 ]
	}
}
```

#### .get(keys)

To get all the `li` `click` handlers, use `.get`:

```js
keyTree.get( [ "click", "li" ] ); //-> [handler1, handler2]
```

To get all `click` handlers, you can also use `.get`:


```js
keyTree.get( [ "click" ] ); //-> [handler1, handler2, handler3]
```

#### .delete(keys)

To delete a handler, use `.delete`:

```js
keyTree.delete( [ "click", "li", handler1 ] );
```

The `keyTree` data structure will look like:

```js
{
	"click": {
		"li": [ handler2 ],
		"span": [ handler3 ]
	}
}
```

To delete the remaining `click` handlers:

```js
keyTree.delete( [ "click" ] );
```

The `keyTree` data structure will look like:

```js
{}
```

## Advanced Use

Often, when a node is created, there needs to be some initial setup, and when a
node is empty, some teardown.

This can be achieved by creating custom types.  For example, perhaps we want to
build an event delegation system where we can delegate from an element like:

```js
eventTree.add( [ document.body, "click", "li", handler ] );
```

And remove that handler like:

```js
eventTree.delete( [ document.body, "click", "li", handler ] );
```


We can do that as follows:

```js
// Create an event handler type.
const Delegator = function( parentKey ) {

	// Custom constructors get called with their parentKey.
	// In this case, the `parentKey` is the element we will
	// delegate from.
	this.element = parentKey;

	// the nested data `{click: [handlers...], dblclick: [handlers...]}`
	this.events = {};

	// the callbacks added for each handler.
	this.delegated = {};
};
canReflect.assignSymbols( Delegator.prototype, {

	// when a new event happens, setup event delegation.
	"can.setKeyValue": function( eventName, handlersBySelector ) {

		this.delegated[ eventName ] = function( ev ) {
			canReflect.each( handlersBySelector, function( handlers, selector ) {
				let cur = ev.target;
				do {
					if ( cur.matches( selector ) ) {
						handlers.forEach( function( handler ) {
							handler.call( cur, ev );
						} );
					}
					cur = cur.parentNode;
				} while ( cur && cur !== ev.currentTarget );
			} );
		};
		this.events[ eventName ] = handlersBySelector;
		this.element.addEventListener( eventName, this.delegated[ eventName ] );
	},
	"can.getKeyValue": function( eventName ) {
		return this.events[ eventName ];
	},

	// when an event gets removed, teardown event delegation and clean up.
	"can.deleteKeyValue": function( eventName ) {
		this.element.removeEventListener( eventName, this.delegated[ eventName ] );
		delete this.delegated[ eventName ];
		delete this.events[ eventName ];
	},

	// we need to know how many items at this node
	"can.getOwnEnumerableKeys": function() {
		return Object.keys( this.events );
	}
} );

// create an event tree that stores:
// - "element being delegated" ->
//   - A "delegator" instance for an event ->
//     - The "selectors" we are delegating ->
//       - The handlers to call
const eventTree = new KeyTree( [ Map, Delegator, Object, Array ] );


// to listen to an event:
function handler() {
	console.log( "an li clicked" );
}

eventTree.add( [ document.body, "click", "li", handler ] );

// to stop listening:
eventTree.delete( [ document.body, "click", "li", handler ] );

// to stop listening to all clicks on the body:
eventTree.delete( [ document.body, "click" ] );

// to stop listening to all events on the body:
eventTree.delete( [ document.body ] );
```


## How it works

`can-key-tree`'s' commented source can be found [here](https://canjs.github.io/can-key-tree/docs/can-key-tree.html).

On a high level, `KeyTree` instances maintain a `this.root` map-type whose keys point to instances of other map-types.  Those
keys eventually point to some list-type instance that contains a list of the leaf-values added to the tree.  `KeyTree`'s
methods walk down the tree structure and use [can-reflect] to perform operations on it.

Watch [this overview video](https://www.youtube.com/watch?v=qVVB2MOO-yM) on `can-key-tree`.

<iframe width="560" height="315" src="https://www.youtube.com/embed/qVVB2MOO-yM" frameborder="0" allowfullscreen></iframe>
