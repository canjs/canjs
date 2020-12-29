@typedef {function(Object, ArrayLike)} can-symbol/symbols/apply can.apply
@parent can-symbol/symbols/call
@description How to apply a List-like as the arguments to a call of the function.

@signature `@@can.apply( obj, args )`

The `can.apply` symbol points to a Function or callable object's apply function, which converts an ArrayLike of arguments into the positional parameters and calls the function with them.

@this {Function} a function or callable
@param {Object} obj the object to call the function on as the bound element
@param {ArrayLike} args The list of arguments to pass to the function


 ```
function func(c) {
	return c.process();
};

// Handle non-native lists or even non-list-likes being passed in
obj[canSymbol.for('can.apply')] = function(ctx, list) {
	list = list.serialize ? list.serialize() : list;
	if(!list[canSymbol.for('can.isListLike')]) {
		list = [list];
	}
	return Function.prototype.apply.call(this, ctx, list); 
};
```
