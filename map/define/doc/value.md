@function can.Map.prototype.define.value value
@parent can.Map.prototype.define

Returns the default value for instances of this can.Map.  This is called before `init`.

@signature `defaulter()`

@this {can.Map} the instance of the can.Map.

@return {*} The default value.  This will be passed through setter and type.