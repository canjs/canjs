@function can.Map.prototype.define.type type
@parent can.Map.prototype.define

Converts a value passed to [can.Map::attr attr] into an appropriate value.

@param {*} newValue The value passed to `attr`.
@param {String} attrName The attribute name being set.
@this {can.Map} the instance of the can.Map.
@return {*} The value that should be passed to `set` or set on the map instance.
