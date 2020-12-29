@function can-key-tree.prototype.add add
@parent can-key-tree.prototype

@description Add values to the tree.

@signature `keyTree.add(keys)`

Adds items into the structure and returns the keyTree.

```js
const keyTree = new KeyTree( [ Object, Object, Array ] );

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

@param {Array} [keys] An array of keys to populate the tree
@return {KeyTree} The keyTree.
