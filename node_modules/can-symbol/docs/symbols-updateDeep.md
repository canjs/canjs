@typedef {function} can-symbol/symbols/updateDeep can.updateDeep
@parent can-symbol/symbols/shape
@description Defines how to change the state of the current object to match the state of another object.

@signature `@@can.updateDeep( source )`

The `can.updateDeep` symbol specifies how a deep update should happen. This means the copying of
all of source's values, and child values onto the current object and removal of values from the current
object that are not in source and its children..  


@this {Object} An object with named properties
@param {Object} source The source of values that will be copied.
