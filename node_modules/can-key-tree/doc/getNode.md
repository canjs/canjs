@function can-key-tree.prototype.getNode getNode
@parent can-key-tree.prototype

@description Get a node from the tree.

@signature `keyTree.getNode(keys)`

Return the node from the keyTree specified by `keys`.

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

To get all the object at `click`, use `.getNode`:

```js
keyTree.getNode( [ "click" ] ); //-> { li: [handler1, handler2], span: [handler2] }
```

@param {Array} [keys] An array of keys to specify where to pull the node from.
@return {Object|Array|Value|undefined} The node from the keyTree specified by the 'keys' path.
