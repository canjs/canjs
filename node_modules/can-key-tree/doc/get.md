@function can-key-tree.prototype.get get
@parent can-key-tree.prototype

@description Return leave values from the tree.

@signature `keyTree.get(keys)`

Return all the leafs from the keyTree under the specified `keys`.

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

To get all the `li` `click` handlers, use `.get`:

```js
keyTree.get( [ "click", "li" ] ); //-> [handler1, handler2]
```

To get all `click` handlers, you can also use `.get`:

```js
keyTree.get( [ "click" ] ); //-> [handler1, handler2, handler3]
```

@param {Array} [keys] An array of keys specifying where to get leaf values.  All leaf values will be
returned under the specified node.  For example `.get([])` returns all leaf values in the entire tree.
@return {ListType} The leaf values from keyTree under the specified `keys` path. The leaf values are returned
  in an instance of the `ListType` specified at the end of the `treeStructure`.  For example, the following
  returns a `Set`:

  ```js
const keyTree = new KeyTree( [ Object, Set ] );
keyTree.get( [] ); //-> Set[]
```
