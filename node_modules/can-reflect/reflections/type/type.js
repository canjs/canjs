"use strict";
var canSymbol = require("can-symbol");
var helpers = require("../helpers");

var plainFunctionPrototypePropertyNames = Object.getOwnPropertyNames((function(){}).prototype);
var plainFunctionPrototypeProto = Object.getPrototypeOf( (function(){}).prototype );
/**
 * @function can-reflect.isConstructorLike isConstructorLike
 * @parent can-reflect/type
 *
 * @description Test if a value looks like a constructor function.
 *
 * @signature `isConstructorLike(func)`
 *
 * Return `true` if `func` is a function and has a non-empty prototype, or implements
 *  [can-symbol/symbols/new `@@@@can.new`]; `false` otherwise.
 *
 * ```js
 * canReflect.isConstructorLike(function() {}); // -> false
 *
 * function Construct() {}
 * Construct.prototype = { foo: "bar" };
 * canReflect.isConstructorLike(Construct); // -> true
 *
 * canReflect.isConstructorLike({}); // -> false
 * !!canReflect.isConstructorLike({ [canSymbol.for("can.new")]: function() {} }); // -> true
 * ```
 *
 * @param  {*}  func maybe a function
 * @return {Boolean} `true` if a constructor; `false` if otherwise.
 */
function isConstructorLike(func){
	/* jshint unused: false */
	// if you can new it ... it's a constructor
	var value = func[canSymbol.for("can.new")];
	if(value !== undefined) {
		return value;
	}

	if(typeof func !== "function") {
		return false;
	}
	// If there are any properties on the prototype that don't match
	// what is normally there, assume it's a constructor
	var prototype = func.prototype;
	if(!prototype) {
		return false;
	}
	// Check if the prototype's proto doesn't point to what it normally would.
	// If it does, it means someone is messing with proto chains
	if( plainFunctionPrototypeProto !== Object.getPrototypeOf( prototype ) ) {
		return true;
	}

	var propertyNames = Object.getOwnPropertyNames(prototype);
	if(propertyNames.length === plainFunctionPrototypePropertyNames.length) {
		for(var i = 0, len = propertyNames.length; i < len; i++) {
			if(propertyNames[i] !== plainFunctionPrototypePropertyNames[i]) {
				return true;
			}
		}
		return false;
	} else {
		return true;
	}
}

/**
 * @function can-reflect.isFunctionLike isFunctionLike
 * @parent can-reflect/type
 * @description Test if a value looks like a function.
 * @signature `isFunctionLike(obj)`
 *
 *  Return `true` if `func` is a function, or implements
 *  [can-symbol/symbols/new `@@@@can.new`] or [can-symbol/symbols/apply `@@@@can.apply`]; `false` otherwise.
 *
 * ```js
 * canReflect.isFunctionLike(function() {}); // -> true
 * canReflect.isFunctionLike({}); // -> false
 * canReflect.isFunctionLike({ [canSymbol.for("can.apply")]: function() {} }); // -> true
 * ```
 *
 * @param  {*}  obj maybe a function
 * @return {Boolean}
 */
var getNewOrApply = helpers.makeGetFirstSymbolValue(["can.new","can.apply"]);
function isFunctionLike(obj){
	var result,
		symbolValue = !!obj && obj[canSymbol.for("can.isFunctionLike")];

	if (symbolValue !== undefined) {
		return symbolValue;
	}

	result = getNewOrApply(obj);
	if(result !== undefined) {
		return !!result;
	}

	return typeof obj === "function";
}

/**
 * @function can-reflect.isPrimitive isPrimitive
 * @parent can-reflect/type
 * @description Test if a value is a JavaScript primitive.
 * @signature `isPrimitive(obj)`
 *
 * Return `true` if `obj` is not a function nor an object via `typeof`, or is null; `false` otherwise.
 *
 * ```js
 * canReflect.isPrimitive(null); // -> true
 * canReflect.isPrimitive({}); // -> false
 * canReflect.isPrimitive(undefined); // -> true
 * canReflect.isPrimitive(1); // -> true
 * canReflect.isPrimitive([]); // -> false
 * canReflect.isPrimitive(function() {}); // -> false
 * canReflect.isPrimitive("foo"); // -> true
 *
 * ```
 *
 * @param  {*}  obj maybe a primitive value
 * @return {Boolean}
 */
function isPrimitive(obj){
	var type = typeof obj;
	if(obj == null || (type !== "function" && type !== "object") ) {
		return true;
	}
	else {
		return false;
	}
}

var coreHasOwn = Object.prototype.hasOwnProperty;
var funcToString = Function.prototype.toString;
var objectCtorString = funcToString.call(Object);

function isPlainObject(obj) {
	// Must be an Object.
	// Because of IE, we also have to check the presence of the constructor property.
	// Make sure that DOM nodes and window objects don't pass through, as well
	if (!obj || typeof obj !== 'object' ) {
		return false;
	}
	var proto = Object.getPrototypeOf(obj);
	if(proto === Object.prototype || proto === null) {
		return true;
	}
	// partially inspired by lodash: https://github.com/lodash/lodash
	var Constructor = coreHasOwn.call(proto, 'constructor') && proto.constructor;
	return typeof Constructor === 'function' && Constructor instanceof Constructor &&
    	funcToString.call(Constructor) === objectCtorString;
}

/**
 * @function can-reflect.isBuiltIn isBuiltIn
 * @parent can-reflect/type
 * @description Test if a value is a JavaScript built-in type.
 * @signature `isBuiltIn(obj)`
 *
 * Return `true` if `obj` is some type of JavaScript native built-in; `false` otherwise.
 *
 * ```js
 * canReflect.isBuiltIn(null); // -> true
 * canReflect.isBuiltIn({}); // -> true
 * canReflect.isBuiltIn(1); // -> true
 * canReflect.isBuiltIn([]); // -> true
 * canReflect.isBuiltIn(function() {}); // -> true
 * canReflect.isBuiltIn("foo"); // -> true
 * canReflect.isBuiltIn(new Date()); // -> true
 * canReflect.isBuiltIn(/[foo].[bar]/); // -> true
 * canReflect.isBuiltIn(new DefineMap); // -> false
 *
 * ```
 *
 * Not supported in browsers that have implementations of Map/Set where
 * `toString` is not properly implemented to return `[object Map]`/`[object Set]`.
 *
 * @param  {*}  obj maybe a built-in value
 * @return {Boolean}
 */
function isBuiltIn(obj) {

	// If primitive, array, or POJO return true. Also check if
	// it is not a POJO but is some type like [object Date] or
	// [object Regex] and return true.
	if (isPrimitive(obj) ||
		Array.isArray(obj) ||
		isPlainObject(obj) ||
		(Object.prototype.toString.call(obj) !== '[object Object]' &&
			Object.prototype.toString.call(obj).indexOf('[object ') !== -1)) {
		return true;
	}
	else {
		return false;
	}
}

/**
 * @function can-reflect.isValueLike isValueLike
 * @parent can-reflect/type
 * @description Test if a value represents a single value (as opposed to several values).
 *
 * @signature `isValueLike(obj)`
 *
 * Return `true` if `obj` is a primitive or implements [can-symbol/symbols/getValue `@@can.getValue`],
 * `false` otherwise.
 *
 * ```js
 * canReflect.isValueLike(null); // -> true
 * canReflect.isValueLike({}); // -> false
 * canReflect.isValueLike(function() {}); // -> false
 * canReflect.isValueLike({ [canSymbol.for("can.isValueLike")]: true}); // -> true
 * canReflect.isValueLike({ [canSymbol.for("can.getValue")]: function() {} }); // -> true
 * canReflect.isValueLike(canCompute()); // -> true
 * canReflect.isValueLike(new DefineMap()); // -> false
 *
 * ```
 *
 * @param  {*}  obj maybe a primitive or an object that yields a value
 * @return {Boolean}
 */
function isValueLike(obj) {
	var symbolValue;
	if(isPrimitive(obj)) {
		return true;
	}
	symbolValue = obj[canSymbol.for("can.isValueLike")];
	if( typeof symbolValue !== "undefined") {
		return symbolValue;
	}
	var value = obj[canSymbol.for("can.getValue")];
	if(value !== undefined) {
		return !!value;
	}
}

/**
 * @function can-reflect.isMapLike isMapLike
 * @parent can-reflect/type
 *
 * @description Test if a value represents multiple values.
 *
 * @signature `isMapLike(obj)`
 *
 * Return `true` if `obj` is _not_ a primitive, does _not_ have a falsy value for
 * [can-symbol/symbols/isMapLike `@@@@can.isMapLike`], or alternately implements
 * [can-symbol/symbols/getKeyValue `@@@@can.getKeyValue`]; `false` otherwise.
 *
 * ```js
 * canReflect.isMapLike(null); // -> false
 * canReflect.isMapLike(1); // -> false
 * canReflect.isMapLike("foo"); // -> false
 * canReflect.isMapLike({}); // -> true
 * canReflect.isMapLike(function() {}); // -> true
 * canReflect.isMapLike([]); // -> false
 * canReflect.isMapLike({ [canSymbol.for("can.isMapLike")]: false }); // -> false
 * canReflect.isMapLike({ [canSymbol.for("can.getKeyValue")]: null }); // -> false
 * canReflect.isMapLike(canCompute()); // -> false
 * canReflect.isMapLike(new DefineMap()); // -> true
 *
 * ```
 *
 * @param  {*}  obj maybe a Map-like
 * @return {Boolean}
 */
function isMapLike(obj) {
	if(isPrimitive(obj)) {
		return false;
	}
	var isMapLike = obj[canSymbol.for("can.isMapLike")];
	if(typeof isMapLike !== "undefined") {
		return !!isMapLike;
	}
	var value = obj[canSymbol.for("can.getKeyValue")];
	if(value !== undefined) {
		return !!value;
	}
	// everything else in JS is MapLike
	return true;
}

/**
 * @function can-reflect.isObservableLike isObservableLike
 * @parent can-reflect/type
 * @description Test if a value (or its keys) can be observed for changes.
 *
 * @signature `isObservableLike(obj)`
 *
 * Return  `true` if `obj` is _not_ a primitive and implements any of
 * [can-symbol/symbols/onValue `@@@@can.onValue`], [can-symbol/symbols/onKeyValue `@@@@can.onKeyValue`], or
 * [can-symbol/symbols/onPatches `@@@@can.onKeys`]; `false` otherwise.
 *
 * ```js
 * canReflect.isObservableLike(null); // -> false
 * canReflect.isObservableLike({}); // -> false
 * canReflect.isObservableLike([]); // -> false
 * canReflect.isObservableLike(function() {}); // -> false
 * canReflect.isObservableLike({ [canSymbol.for("can.onValue")]: function() {} }); // -> true
 * canReflect.isObservableLike({ [canSymbol.for("can.onKeyValue")]: function() {} }); // -> true
 * canReflect.isObservableLike(canCompute())); // -> true
 * canReflect.isObservableLike(new DefineMap())); // -> true
 * ```
 *
 * @param  {*}  obj maybe an observable
 * @return {Boolean}
 */

// Specially optimized
var onValueSymbol = canSymbol.for("can.onValue"),
	onKeyValueSymbol = canSymbol.for("can.onKeyValue"),
	onPatchesSymbol = canSymbol.for("can.onPatches");
function isObservableLike( obj ) {
	if(isPrimitive(obj)) {
		return false;
	}
	return Boolean(obj[onValueSymbol] || obj[onKeyValueSymbol] || obj[onPatchesSymbol]);
}

/**
 * @function can-reflect.isListLike isListLike
 * @parent can-reflect/type
 *
 * @description Test if a value looks like a constructor function.
 *
 * @signature `isListLike(list)`
 *
 * Return `true` if `list` is a `String`, <br>OR `list` is _not_ a primitive and implements `@@@@iterator`,
 * <br>OR `list` is _not_ a primitive and returns `true` for `Array.isArray()`, <br>OR `list` is _not_ a primitive and has a
 * numerical length and is either empty (`length === 0`) or has a last element at index `length - 1`; <br>`false` otherwise
 *
 * ```js
 * canReflect.isListLike(null); // -> false
 * canReflect.isListLike({}); // -> false
 * canReflect.isListLike([]); // -> true
 * canReflect.isListLike("foo"); // -> true
 * canReflect.isListLike(1); // -> false
 * canReflect.isListLike({ [canSymbol.for("can.isListLike")]: true }); // -> true
 * canReflect.isListLike({ [canSymbol.iterator]: function() {} }); // -> true
 * canReflect.isListLike({ length: 0 }); // -> true
 * canReflect.isListLike({ length: 3 }); // -> false
 * canReflect.isListLike({ length: 3, "2": true }); // -> true
 * canReflect.isListLike(new DefineMap()); // -> false
 * canReflect.isListLike(new DefineList()); // -> true
 * ```
 *
 * @param  {*}  list maybe a List-like
 * @return {Boolean}
 */
function isListLike( list ) {
	var symbolValue,
		type = typeof list;
	if(type === "string") {
		return true;
	}
	if( isPrimitive(list) ) {
		return false;
	}
	symbolValue = list[canSymbol.for("can.isListLike")];
	if( typeof symbolValue !== "undefined") {
		return symbolValue;
	}
	var value = list[canSymbol.iterator];
	if(value !== undefined) {
		return !!value;
	}
	if(Array.isArray(list)) {
		return true;
	}
	return helpers.hasLength(list);
}

/**
 * @function can-reflect.isSymbolLike isSymbolLike
 * @parent can-reflect/type
 *
 * @description Test if a value is a symbol or a [can-symbol].
 *
 * @signature `isSymbolLike(symbol)`
 *
 * Return `true` if `symbol` is a native Symbol, or evaluates to a String with a prefix
 * equal to that of CanJS's symbol polyfill; `false` otherwise.
 *
 * ```js
 * /* ES6 *\/ canReflect.isSymbolLike(Symbol.iterator); // -> true
 * canReflect.isSymbolLike(canSymbol.for("foo")); // -> true
 * canReflect.isSymbolLike("@@symbol.can.isSymbol"); // -> true (due to polyfill for non-ES6)
 * canReflect.isSymbolLike("foo"); // -> false
 * canReflect.isSymbolLike(null); // -> false
 * canReflect.isSymbolLike(1); // -> false
 * canReflect.isSymbolLike({}); // -> false
 * canReflect.isSymbolLike({ toString: function() { return "@@symbol.can.isSymbol"; } }); // -> true
 * ```
 *
 * @param  {*}  symbol maybe a symbol
 * @return {Boolean}
 */

var supportsNativeSymbols = (function() {
	var symbolExists = typeof Symbol !== "undefined" && typeof Symbol.for === "function";

	if (!symbolExists) {
		return false;
	}

	var symbol = Symbol("a symbol for testing symbols");
	return typeof symbol === "symbol";
}());

var isSymbolLike;
if(supportsNativeSymbols) {
	isSymbolLike = function(symbol) {
		return typeof symbol === "symbol";
	};
} else {
	var symbolStart = "@@symbol";
	isSymbolLike = function(symbol) {
		if(typeof symbol === "object" && !Array.isArray(symbol)){
			return symbol.toString().substr(0, symbolStart.length) === symbolStart;
		} else {
			return false;
		}
	};
}

module.exports = {
	isConstructorLike: isConstructorLike,
	isFunctionLike: isFunctionLike,
	isListLike: isListLike,
	isMapLike: isMapLike,
	isObservableLike: isObservableLike,
	isPrimitive: isPrimitive,
	isBuiltIn: isBuiltIn,
	isValueLike: isValueLike,
	isSymbolLike: isSymbolLike,
	/**
	 * @function can-reflect.isMoreListLikeThanMapLike isMoreListLikeThanMapLike
	 * @parent can-reflect/type
	 *
	 * @description Test if a value should be treated as a list instead of a map.
	 *
	 * @signature `isMoreListLikeThanMapLike(obj)`
	 *
	 * Return  `true` if `obj` is an Array, declares itself to be more ListLike with
	 * `@@@@can.isMoreListLikeThanMapLike`, or self-reports as ListLike but not as MapLike; `false` otherwise.
	 *
	 * ```js
	 * canReflect.isMoreListLikeThanMapLike([]); // -> true
	 * canReflect.isMoreListLikeThanMapLike(null); // -> false
	 * canReflect.isMoreListLikeThanMapLike({}); // -> false
	 * canReflect.isMoreListLikeThanMapLike(new DefineList()); // -> true
	 * canReflect.isMoreListLikeThanMapLike(new DefineMap()); // -> false
	 * canReflect.isMoreListLikeThanMapLike(function() {}); // -> false
	 * ```
	 *
	 * @param  {Object}  obj the object to test for ListLike against MapLike traits.
	 * @return {Boolean}
	 */
	isMoreListLikeThanMapLike: function(obj){
		if(Array.isArray(obj)) {
			return true;
		}
		if(obj instanceof Array) {
			return true;
		}
		if( obj == null ) {
			return false;
		}
		var value = obj[canSymbol.for("can.isMoreListLikeThanMapLike")];
		if(value !== undefined) {
			return value;
		}
		var isListLike = this.isListLike(obj),
			isMapLike = this.isMapLike(obj);
		if(isListLike && !isMapLike) {
			return true;
		} else if(!isListLike && isMapLike) {
			return false;
		}
	},
	/**
	 * @function can-reflect.isIteratorLike isIteratorLike
	 * @parent can-reflect/type
	 * @description Test if a value looks like an iterator.
	 * @signature `isIteratorLike(obj)`
	 *
	 * Return `true` if `obj` has a key `"next"` pointing to a zero-argument function; `false` otherwise
	 *
	 * ```js
	 * canReflect.isIteratorLike([][Symbol.iterator]()); // -> true
	 * canReflect.isIteratorLike(new DefineList()[canSymbol.iterator]()); // -> true
	 * canReflect.isIteratorLike(new DefineMap()[canSymbol.iterator]()); // -> true
	 * canReflect.isIteratorLike(null); // -> false
	 * canReflect.isIteratorLike({ next: function() {} }); // -> true
	 * canReflect.isIteratorLike({ next: function(foo) {} }); // -> false (iterator nexts do not take arguments)
	 * ```
	 *
	 * @param  {Object}  obj the object to test for Iterator traits
	 * @return {Boolean}
	 */
	isIteratorLike: function(obj){
		return obj &&
			typeof obj === "object" &&
			typeof obj.next === "function" &&
			obj.next.length === 0;
	},
	/**
	 * @function can-reflect.isPromise isPromise
	 * @parent can-reflect/type
	 * @description Test if a value is a promise.
	 *
	 * @signature `isPromise(obj)`
	 *
	 * Return `true` if `obj` is an instance of promise or `.toString` returns `"[object Promise]"`.
	 *
	 * ```js
	 * canReflect.isPromise(Promise.resolve()); // -> true
	 * ```
	 *
	 * @param  {*}  obj the object to test for Promise traits.
	 * @return {Boolean}
	 */
	isPromise: function(obj){
		return (obj instanceof Promise || (Object.prototype.toString.call(obj) === '[object Promise]'));
	},
	/**
	 * @function can-reflect.isPlainObject isPlainObject
	 * @parent can-reflect/type
	 * @description Test if a value is an object created with `{}` or `new Object()`.
	 *
	 * @signature `isPlainObject(obj)`
	 *
	 * Attempts to determine if an object is a plain object like those you would create using the curly braces syntax: `{}`. The following are not plain objects:
	 *
	 * 1. Objects with prototypes (created using the `new` keyword).
	 * 2. Booleans.
	 * 3. Numbers.
	 * 4. NaN.
	 *
	 * ```js
	 * var isPlainObject = require("can-reflect").isPlainObject;
	 *
	 * // Created with {}
	 * console.log(isPlainObject({})); // -> true
	 *
	 * // new Object
	 * console.log(isPlainObject(new Object())); // -> true
	 *
	 * // Custom object
	 * var Ctr = function(){};
	 * var obj = new Ctr();
	 *
	 * console.log(isPlainObject(obj)); // -> false
	 * ```
	 *
	 * @param  {Object}  obj the object to test.
	 * @return {Boolean}
	 */
	isPlainObject: isPlainObject
};
