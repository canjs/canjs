@typedef {function(Array<can-symbol/types/Patch>)} can-symbol/symbols/onPatches can.onPatches
@parent can-symbol/symbols/observe
@description Defines how to listen to patch changes on an object.

@signature `@can.onPatches( handler(patches), queueName )`

The `@@can.onPatches` symbol points to a function that registers
`handler` to be called back with an array of changes that have happened
on the client.  

The following mutations on a list-like object will
produce the patch objects in the comments:

```js
const list = [];

list.count = 3000; //-> {type: "add", key: "count", 3000}

list.push( "a" ); //-> {type: "splice", index: 0, insert: ["a"]}
```

@this {Object} Any Map-like object with named properties.
@param {function(Array<can-symbol/types/Patch>)} handler(patches) The
string key to bind on changes to.  The handler must be called back with an
array of [can-symbol/types/Patch] objects.
@param {String} queueName The [can-queues] queue the `handler`
should be enqueued within.  Defaults to `"mutate"`.
