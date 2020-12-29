@typedef {Object} can-key-tree.types.keyTreeCallbacks KeyTreeCallbacks
@parent can-key-tree.types

@description Defines callbacks `onFirst` and/or `onEmpty`.

@type {Object} Defines callbacks `onFirst` and/or `onEmpty`.

```js
const keyTreeCallbacks = {
	onFirst: function() {

		// called when the first node is added
	},
	onEmpty: function() {

		// called when all nodes are removed
	}
};
const keyTree = new KeyTree( [ Object, Object, Array ], keyTreeCallbacks );

function handler1() {}

keyTree.add( [ "click", "li", handler1 ] );

// onFirst is called with a context (`this`) of the keyTree instance and no arguments

keyTree.delete( [] );

// onEmpty is called with a context (`this`) of the keyTree instance and no arguments
```

  @option {Function} [onFirst] called with a context (`this`) of the keyTree instance and no arguments when the tree gets its first item added.

  @option {Function} [onEmpty] called with a context (`this`) of the keyTree instance and no arguments when the tree becomes empty.

