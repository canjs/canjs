@function can-key-tree.prototype.delete delete
@parent can-key-tree.prototype

@description Delete values from the tree.

@signature `keyTree.delete(keys)`

Delete everything from the keyTree at the specified `keys`.

Given this setup:

```js
const keyTree = new KeyTree( [ Object, Object, Array ] );

function handler1() {}
function handler2() {}
function handler3() {}

keyTree.add( [ "click", "li", handler1 ] );
keyTree.add( [ "click", "li", handler2 ] );
keyTree.add( [ "click", "span", handler3 ] );
```

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

@param {Array} [keys] An array of keys to specify where to delete
@return {boolean} If the node was found and the delete was successful.
