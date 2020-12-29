@typedef {function(Array<can-symbol/types/Patch>)} can-symbol/symbols/offPatches can.offPatches
@parent can-symbol/symbols/observe
@description Defines how to stop listening to patch changes on an object.

@signature `@can.offPatches( handler, queueName )`

The `@@can.offPatches` symbol points to a function that unregisters a
`handler` bound with [can-symbol/symbols/onPatches].

@this {Object} Any Map-like object with named properties.
@param {function(Array<can-symbol/types/Patch>)} handler(patches) The same handler
function passed to [can-symbol/symbols/onPatches].
@param {String} queueName The [can-queues] queue the `handler`
should be enqueued within.  Defaults to `"mutate"`.
