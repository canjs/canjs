@typedef {function} can-symbol/symbols/assignDeep can.assignDeep
@parent can-symbol/symbols/shape
@description Defines how to copy values onto an object.

@signature `@@can.assignDeep( source )`

The `can.assignDeep` symbol specifies how a deep assign should happen. This means the copying of
all of sources values, and child values onto the current object.  


@this {Object} An object with named properties
@param {Object} source The source of values that will be copied.
