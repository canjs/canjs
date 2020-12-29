@function can-key-tree.prototype.isEmpty isEmpty
@parent can-key-tree.prototype

@signature `keyTree.isEmpty()`

Returns if the keyTree is empty.

```js
var keyTree = new KeyTree( [Object, Object, Array] );

function handler1 () {}
function handler2 () {}
keyTree.isEmpty(); //-> true

keyTree.add( ["click", "li", handler1] );
keyTree.add( ["click", "li", handler2] );
keyTree.isEmpty(); //-> false
```

@return {Boolean} Returns `true` if the keyTree is empty, `false` if otherwise.
