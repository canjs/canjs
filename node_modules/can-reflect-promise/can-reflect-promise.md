@function {Promise} can-reflect-promise
@parent can-typed-data
@collection can-infrastructure
@package ./package.json
@description Expose an observable, Map-like API on Promise types.

@signature `canReflectPromise(promise)`

If `promise` is an instance of a Promise type (either provided natively by the platform or by a polyfill library), the prototype
of the Promise type is decorated with [can-symbol] symbols for `@@@@can.onKeyValue`, `@@@@can.offKeyValue`,
`@@@@can.getKeyValue`, `@@@@can.onValue`, and `@@@@can.offValue`, which allow it to be used like an observable Map-like in 
reflection.

Then `promise` and all future instances of `promise.constructor` will be initialized on first access to have the following keys
available through [can-symbol/symbols/getKeyValue @@@@can.getKeyValue]:

* "state" -- one of "pending", "resolved", or "rejected"
* "isPending" -- true if the promise neither resolved nor rejected, false otherwise.
* "isResolved" -- true if the promise is resolved, false otherwise.
* "isRejected" -- true if the promise is rejected, false otherwise.
* "value" -- the resolved value of the promise if resolved, otherwise undefined.
* "reason" -- the rejected value of the promise if rejected, otherwise undefined.

> Note that, due to native Promises' lack of inspection, it is impossible to tell whether a Promise is resolved or rejected 
without using `.then()`. If the Promise is Promises/A+ compliant, then at the time the Promise is initialized by 
`can-reflect-promise`, `isPending` will always be true, even if 
the Promise has already resolved, and will remain so during synchronous execution.  On the next tick, the state will update to 
`resolved`/`rejected` if the Promise has already updated its state.  The best strategy for ensuring a proper read of a resolved
value or rejected reason is to listen for the change in state or 
value with [can-symbol/symbols/onKeyValue @@@@can.onKeyValue] immediately after creating a Promise.

In the cases where `promise` is a plain object (e.g. if it is a `jQuery.Deferred`), the symbols will be applied to `promise`
itself, not to the proto.

```
var p = new Promise(function(resolve) {
	setTimeout(resolve.bind(null, "a"), 10);
});

canReflectPromise(p);

canReflect.getKeyValue(p, "isPending"); // -> true

setTimeout(function() {
	canReflect.getKeyValue(p, "isResolved"); // -> true
	canReflect.getKeyValue(p, "value"); // -> "a"
}, 20);
```

@param {Promise} promise any Promise, Promise-like, or thenable.
