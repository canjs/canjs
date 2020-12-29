"use strict";
var canSymbol = require("can-symbol");
var typeReflections = require("../type/type");

module.exports = {
	/**
	 * @function {function(...), Object, ...} can-reflect/call.call call
	 * @parent can-reflect/call
	 * @description  Call a callable, with a context object and parameters
	 *
	 * @signature `call(func, context, ...rest)`
	 *
	 * Call the callable `func` as if it were a function, bound to `context` and with any additional parameters
	 * occurring after `context` set to the positional parameters.
	 *
	 * Note that `func` *must* either be natively callable, implement [can-symbol/symbols/apply @@@@can.apply],
	 * or have a callable `apply` property to work with `canReflect.call`
	 *
	 * ```js
	 * var compute = canCompute("foo");
	 *
	 * canReflect.call(compute, null, "bar");
	 * canReflect.call(compute, null); // -> "bar"
	 * ```
	 *
	 * @param  {function(...)} func the function to call with the supplied arguments
	 * @param  {Object} context the context object to set as `this` on the function call
	 * @param  {*} rest any arguments after `context` will be passed to the function call
	 * @return {*}  return types and values are determined by the call to `func`
	 */
	call: function(func, context){
		var args = [].slice.call(arguments, 2);
		var apply = func[canSymbol.for("can.apply")];
		if(apply) {
			return apply.call(func, context, args);
		} else {
			return func.apply(context, args);
		}
	},
	/**
	 * @function {function(...), Object, ...} can-reflect/call.apply apply
	 * @parent can-reflect/call
	 * @description  Call a callable, with a context object and a list of parameters
	 *
	 * @signature `apply(func, context, args)`
	 *
	 * Call the callable `func` as if it were a function, bound to `context` and with any additional parameters
	 * contained in the Array-like `args`
	 *
	 * Note that `func` *must* either be natively callable, implement [can-symbol/symbols/apply @@@@can.apply],
	 * or have a callable `apply` property to work with `canReflect.apply`
	 *
	 * ```js
	 * var compute = canCompute("foo");
	 *
	 * canReflect.apply(compute, null, ["bar"]);
	 * canReflect.apply(compute, null, []); // -> "bar"
	 * ```
	 *
	 * @param  {function(...)} func the function to call
	 * @param  {Object} context the context object to set as `this` on the function call
	 * @param  {*} args arguments to be passed to the function call
	 * @return {*}  return types and values are determined by the call to `func`
	 */
	apply: function(func, context, args){
		var apply = func[canSymbol.for("can.apply")];
		if(apply) {
			return apply.call(func, context, args);
		} else {
			return func.apply(context, args);
		}
	},
	/**
	 * @function {function(...), ...} can-reflect/call.new new
	 * @parent can-reflect/call
	 * @description  Construct a new instance of a callable constructor
	 *
	 * @signature `new(func, ...rest)`
	 *
	 * Call the callable `func` as if it were a function, bound to a new instance of `func`, and with any additional
	 * parameters occurring after `func` set to the positional parameters.
	 *
	 * Note that `func` *must* either implement [can-symbol/symbols/new @@@@can.new],
	 * or have a callable `apply` property *and* a prototype to work with `canReflect.new`
	 *
	 * ```js
	 * canReflect.new(DefineList, ["foo"]); // -> ["foo"]<DefineList>
	 * ```
	 *
	 * @param  {function(...)} func a constructor
	 * @param  {*} rest arguments to be passed to the constructor
	 * @return {Object}  if `func` returns an Object, that returned Object; otherwise a new instance of `func`
	 */
	"new": function(func){
		var args = [].slice.call(arguments, 1);
		var makeNew = func[canSymbol.for("can.new")];
		if(makeNew) {
			return makeNew.apply(func, args);
		} else {
			var context = Object.create(func.prototype);
			var ret = func.apply(context, args);
			if(typeReflections.isPrimitive(ret)) {
				return context;
			} else {
				return ret;
			}
		}
	}
};
