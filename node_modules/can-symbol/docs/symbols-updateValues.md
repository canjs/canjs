@typedef {function()} can-symbol/symbols/updateValues can.updateValues
@parent can-symbol/symbols/get-set
@description Add and remove multiple values at once.

@signature `@@can.updateValues( index, removing, adding )`

The `@@@@can.updateValues` symbol points to a function that can add
and remove multiple items at once.  It's similar to splice, but
is passed an array of items to remove instead of how many items to
be removed.


@this {*} Anything object with this symbol.
@param {Number} index
@param {Array} removing An array of the items to remove.
@param {Array} adding An Array of the items to add.
