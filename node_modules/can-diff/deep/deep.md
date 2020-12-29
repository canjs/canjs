@module {function} can-diff/deep/deep
@parent can-diff

@description Take a difference of nested maps or lists.

@signature `diffDeep(destination, source)`

Find the differences between two objects or lists, including nested maps or lists.

```js
import {diff} from "can";

diff.deep({inner: {}}, {inner: {a:'foo'}})
//-> [{
//    key: 'inner.a',
//    type: 'add',
//    value: 'foo'
// }]


patches = diff.deep({inner: []}, {inner: ['a']});
//-> [{
//    key: 'inner',
//    type: "splice",
//    index: 0,
//    deleteCount: 0,
//    insert: ['a']
// }]
```


@param {Object} destination The object that will be updated.
@param {Object} source The object used to update `destination`.
@return {Array<Patches>} An array of patches objects.  All patch objects will have a `key` property, even
`"splice"` type patch objects.  The `key` is the property that was changed. A dot (`.`) in the key signifies
that the key was part of a nested property.

@body


## Use

`mergeDeep` is useful when dealing with nested data sources.  It will make sure
that the right nested objects get updated.

For example, say a `Todo` and its nested `User` type are defined as follows:

```js
const User = DefineMap.extend("User",{
    id: "number",
    name: "string"
});

const Todo = DefineMap.extend("Todo",{
    id: {identity: true},
    name: "string",
    complete: "boolean",
    assignedTo: [User]
});
```

If a todo like the following:

```js
var justin = new User({id: 20, name: "Justin"}),
    ramiya = new User({id: 21, name: "Ramiya"});

var todo = new Todo({
    id: 1,
    name: "mow lawn",
    complete: false,
    assignedTo: [justin, ramiya]
});
```

is updated with data like:

```js
import {diff} from "diff";
diff.mergeDeep(todo, {
    id: 1,
    name: "mow lawn",
    complete: true,
    assignedTo: [{
        id: 21, name: "Ramiya Meyer"
    }]
})
```

> NOTICE: The `todo.assignedTo` array removes the Justin todo and updates the Ramiya todo.

__Without__ specifying the identity property of `User`, the `justin` instance's `id` and `name` will be
updated (this is what [can-reflect.updateDeep] would do):

```js
justin.id //-> 21
justin.name //-> "Ramiya Meyer"
```

However, if the `User` object's `identity` property __is specified__ as follows:

```js
const User = DefineMap.extend("User",{
    id: {identity: true, type: "number"},
    name: "string"
});
```

When the update happens, the `ramiya` instance will be updated correctly:

```js
ramiya.id //-> 21
ramiya.name //-> "Ramiya Meyer"
```
