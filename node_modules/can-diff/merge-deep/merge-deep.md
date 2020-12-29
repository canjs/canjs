@module {function} can-diff/merge-deep/merge-deep
@parent can-diff

@description Update the contents of one object with another object.

@signature `mergeDeep(destination, source)`

Makes `destination` look like `source`.  While this is very similar to
[can-reflect.updateDeep], this uses diffing to make minimal changes to lists using
the schemas of objects in the destination.

```js
import {diff} from "can";

var ramiya = new User({id: 21, name: "Ramiya"});

var todo = new Todo({
    id: 1,
    name: "mow lawn",
    complete: false,
    assignedTo: [{id: 20, name: "Justin"}, ramiya]
});

diff.mergeDeep(todo, {
    id: 1,
    name: "mow lawn",
    complete: true,
    assignedTo: [{
        id: 21, name: "Ramiya Meyer"
    }]
})

ramiya //-> User({id: 21, name: "Ramiya Meyer"})
```


@param {Object} destination The object that will be updated.
@param {Object} source The object used to update `destination`.
@return {Object} The `destination` after it has been updated.

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
