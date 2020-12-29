@function can-key-tree.prototype.size size
@parent can-key-tree.prototype

@signature `keyTree.size()`

Returns the size of the keyTree

```js
const keyTree = new KeyTree( [ Object, Object, Array ] );

function handler1() {}
function handler2() {}
keyTree.size(); //-> 0

keyTree.add( [ "click", "li", handler1 ] );
keyTree.add( [ "click", "li", handler2 ] );
keyTree.size(); //-> 2
```

@return {Number} The size of the keyTree
