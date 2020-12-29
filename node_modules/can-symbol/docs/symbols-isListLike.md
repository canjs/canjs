@typedef {Boolean} can-symbol/symbols/isFunctionLike can.isFunctionLike
@parent can-symbol/symbols/type
@description Set to `true` on objects with numeric indexes and length.

@signature `@@can.isFunctionLike`

Setting the value of `can.isFunctionLike` to `true` on an object shows that this object can be called as a function. Setting it to `false` on a function shows that it should not be called as a function.
