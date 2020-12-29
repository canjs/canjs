@typedef {Object} can-symbol/types/Patch Patch
@parent can-symbol/types

@description A patch object that describes a mutation on an object.


@signature `{type: "add", key, value}`

`add` patches signal that a key was added to an object.

```js
{ type: "add", key: "b", value: 1 }
```

@param {String} key The name of the key that was added to the object.
@param {Any} value The value of the key after it was added.

@signature `{type: "delete", key}`

`delete` patches signal that a key was deleted from an object.

```js
{ type: "delete", key: "a" }
```

@param {String} key The name of the key that was deleted from the object.

@signature `{type: "set", key, value}`

`set` patches signal that an existing key's value was set to another value.

```js
{ type: "set", key: "c", value: 2 }
```

@param {String} key The name of the key that was update on the object.
@param {Any} value The value of the key after it was set.

@signature `{type: "splice", index, deleteCount, insert}`

`splice` patches signal a list-like object had enumerable values added, removed
or both at a specific index.

```js
{ type: "splice", index: 0, deleteCount: 10, insert: [ item1, item2 ] }
````

@param {Number} index The index where values were added, removed, or both.
@param {Number} deleteCount The number of items removed at the index.
@param {Array<Any>} insert An array of items inserted.

@signature `{type: "move", fromIndex, toIndex}`

`move` patches signal a list-like object had an enumerable value move from one
position to another.

```js
{ type: "move",   fromIndex: 1, toIndex: 2 }
```

@param {Number} fromIndex The starting index of the value.
@param {Number} toIndex The index the value was moved to.

@signature `{type: "values", delete, insert}`

`values` patches signal a container-like object (like `Set`) has
had items added or removed.

```js
{ type: "values", delete: [ item0 ], insert: [ item1, item2 ] }
```

@param {Array<Any>} [delete] The items added to the object.
@param {Array<Any>} [insert] The items removed from the object.
