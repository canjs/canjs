"use strict";
var canSymbol = require("can-symbol");
var getSetReflections = require("../get-set/get-set");
var typeReflections = require("../type/type");
var helpers = require("../helpers");


// IE-remove-start
var getPrototypeOfWorksWithPrimitives = true;
try {
	Object.getPrototypeOf(1);
} catch(e) {
	getPrototypeOfWorksWithPrimitives = false;
}
// IE-remove-end

var ArrayMap;
if(typeof Map === "function") {
	ArrayMap = Map;
} else {
	// IE-remove-start
	var isEven = function isEven(num) {
		return num % 2 === 0;
	};

	// A simple map that stores items in an array.
	// like [key, value]
	// You can find the value by searching for the key and then +1.
	ArrayMap = function(){
		this.contents = [];
	};

	ArrayMap.prototype = {
		/**
		 * Get an index of a key. Because we store boths keys and values in
		 * a flat array, we ensure we are getting a key by checking that it is an
		 * even number index (all keys are even number indexed).
		 **/
		_getIndex: function(key) {
			var idx;
			do {
				idx = this.contents.indexOf(key, idx);
			} while(idx !== -1 && !isEven(idx));
			return idx;
		},
		has: function(key){
			return this._getIndex(key) !== -1;
		},
		get: function(key){
			var idx = this._getIndex(key);
			if(idx !== -1) {
				return this.contents[idx + 1];
			}
		},
		set: function(key, value){
			var idx = this._getIndex(key);
			if(idx !== -1) {
				// Key already exists, replace the value.
				this.contents[idx + 1] = value;
			} else {
				this.contents.push(key);
				this.contents.push(value);
			}
		},
		"delete": function(key){
			var idx = this._getIndex(key);
			if(idx !== -1) {
				// Key already exists, replace the value.
				this.contents.splice(idx, 2);
			}
		}
	};
	// IE-remove-end
}

var hasOwnProperty = Object.prototype.hasOwnProperty;

var shapeReflections;

var shiftFirstArgumentToThis = function(func){
	return function(){
		var args = [this];
		args.push.apply(args, arguments);
		return func.apply(null,args);
	};
};

var getKeyValueSymbol = canSymbol.for("can.getKeyValue");
var shiftedGetKeyValue = shiftFirstArgumentToThis(getSetReflections.getKeyValue);
var setKeyValueSymbol = canSymbol.for("can.setKeyValue");
var shiftedSetKeyValue = shiftFirstArgumentToThis(getSetReflections.setKeyValue);

var sizeSymbol = canSymbol.for("can.size");

var hasUpdateSymbol = helpers.makeGetFirstSymbolValue(["can.updateDeep","can.assignDeep","can.setKeyValue"]);
var shouldUpdateOrAssign = function(obj){
	return typeReflections.isPlainObject(obj) || Array.isArray(obj) || !!hasUpdateSymbol(obj);
};

// is the value itself its serialized value
function isSerializedHelper(obj){
	if (typeReflections.isPrimitive(obj)) {
		return true;
	}
	if(hasUpdateSymbol(obj)) {
		return false;
	}
	return typeReflections.isBuiltIn(obj) && !typeReflections.isPlainObject(obj) && !Array.isArray(obj) && !typeReflections.isObservableLike(obj);
}

// IE11 doesn't support primitives
var Object_Keys;
try{
	Object.keys(1);
	Object_Keys = Object.keys;
} catch(e) {
	Object_Keys = function(obj){
		if(typeReflections.isPrimitive(obj)) {
			return [];
		} else {
			return Object.keys(obj);
		}
	};
}

function createSerializeMap(Type) {
	var MapType = Type || ArrayMap;
	return {
		unwrap: new MapType(),
		serialize: new MapType() ,
		isSerializing: {
			unwrap: new MapType(),
			serialize: new MapType()
		},
		circularReferenceIsSerializing: {
			unwrap: new MapType(),
			serialize: new MapType()
		}
	};
}

function makeSerializer(methodName, symbolsToCheck){
	// A local variable that is shared with all operations that occur withing a single
	// outer call to serialize()
	var serializeMap = null;

	// Holds the value of running serialize(), preserving the same map for all
	// internal instances.
	function SerializeOperation(MapType) {
		this.first = !serializeMap;

		if(this.first) {
			serializeMap = createSerializeMap(MapType);
		}

		this.map = serializeMap;
		this.result = null;
	}

	SerializeOperation.prototype.end = function(){
		// If this is the first, outer call, clean up the serializeMap.
		if(this.first) {
			serializeMap = null;
		}
		return this.result;
	};

	return function serializer(value, MapType){
		if (isSerializedHelper(value)) {
			return value;
		}

		var operation = new SerializeOperation(MapType);

		if(typeReflections.isValueLike(value)) {
			operation.result = this[methodName](getSetReflections.getValue(value));

		} else {
			// Date, RegEx and other Built-ins are handled above
			// only want to do something if it's intended to be serialized
			// or do nothing for a POJO

			var isListLike = typeReflections.isIteratorLike(value) || typeReflections.isMoreListLikeThanMapLike(value);
			operation.result = isListLike ? [] : {};

			// handle maping to what is serialized
			if( operation.map[methodName].has(value) ) {
				// if we are in the process of serializing the first time, setup circular reference detection.
				if(operation.map.isSerializing[methodName].has(value)) {
					operation.map.circularReferenceIsSerializing[methodName].set(value, true);
				}
				return operation.map[methodName].get(value);
			} else {
				operation.map[methodName].set(value, operation.result);
			}

			for(var i = 0, len = symbolsToCheck.length ; i< len;i++) {
				var serializer = value[symbolsToCheck[i]];
				if(serializer) {
					// mark that we are serializing
					operation.map.isSerializing[methodName].set(value, true);
					var oldResult = operation.result;
					operation.result = serializer.call(value, oldResult);
					operation.map.isSerializing[methodName].delete(value);

					// if the result differs, but this was circular, blow up.
					if(operation.result !== oldResult) {
						// jshint -W073
						if(operation.map.circularReferenceIsSerializing[methodName].has(value)) {
							// Circular references should use a custom serializer
							// that sets the serialized value on the object
							// passed to it as the first argument e.g.
							// function(proto){
							//   return proto.a = canReflect.serialize(this.a);
							// }
							operation.end();
							throw new Error("Cannot serialize cirular reference!");
						}
						operation.map[methodName].set(value, operation.result);
					}
					return operation.end();
				}
			}

			if (typeof obj ==='function') {
				operation.map[methodName].set(value, value);

				operation.result = value;
			} else if( isListLike ) {
				this.eachIndex(value,function(childValue, index){
					operation.result[index] = this[methodName](childValue);
				},this);
			} else {
				this.eachKey(value,function(childValue, prop){
					operation.result[prop] = this[methodName](childValue);
				},this);
			}
		}

		return operation.end();
	};
}

// returns a Map type of the keys mapped to true
var makeMap;
if(typeof Map !== "undefined") {
	makeMap = function(keys) {
		var map = new Map();
		shapeReflections.eachIndex(keys, function(key){
			map.set(key, true);
		});
		return map;
	};
} else {
	makeMap = function(keys) {
		var map = {};
		keys.forEach(function(key){
			map[key] = true;
		});

		return {
			get: function(key){
				return map[key];
			},
			set: function(key, value) {
				map[key] = value;
			},
			keys: function(){
				return keys;
			}
		};
	};
}

// creates an optimized hasOwnKey lookup.
// If the object has hasOwnKey, then we just use that.
// Otherwise, try to put all keys in a map.
var fastHasOwnKey = function(obj){
	var hasOwnKey = obj[canSymbol.for("can.hasOwnKey")];
	if(hasOwnKey) {
		return hasOwnKey.bind(obj);
	} else {
		var map = makeMap( shapeReflections.getOwnEnumerableKeys(obj) );
		return function(key) {
			return map.get(key);
		};
	}
};


// combines patches if it makes sense
function addPatch(patches, patch) {
	var lastPatch = patches[patches.length -1];
	if(lastPatch) {
		// same number of deletes and counts as the index is back
		if(lastPatch.deleteCount === lastPatch.insert.length && (patch.index - lastPatch.index === lastPatch.deleteCount) ) {
			lastPatch.insert.push.apply(lastPatch.insert, patch.insert);
			lastPatch.deleteCount += patch.deleteCount;
			return;
		}
	}
	patches.push(patch);
}

function updateDeepList(target, source, isAssign) {
	var sourceArray = this.toArray(source); // jshint ignore:line

	var patches = [],
		lastIndex = -1;
	this.eachIndex(target, function(curVal, index){ // jshint ignore:line
		lastIndex = index;
		// If target has more items than the source.
		if(index >= sourceArray.length) {
			if(!isAssign) {
				// add a patch that removes the last items
				addPatch(patches, {index: index, deleteCount: target.length - index + 1, insert: []});
			}
			return false;
		}
		var newVal = sourceArray[index];
		if( typeReflections.isPrimitive(curVal) || typeReflections.isPrimitive(newVal) || shouldUpdateOrAssign(curVal) === false ) {
			addPatch(patches, {index: index, deleteCount: 1, insert: [newVal]});
		} else {
			if(isAssign === true) {
				this.assignDeep(curVal, newVal);
			} else {
				this.updateDeep(curVal, newVal);
			}

		}
	}, this); // jshint ignore:line
	// add items at the end
	if(sourceArray.length > lastIndex) {
		addPatch(patches, {index: lastIndex+1, deleteCount: 0, insert: sourceArray.slice(lastIndex+1)});
	}
	for(var i = 0, patchLen = patches.length; i < patchLen; i++) {
		var patch = patches[i];
		getSetReflections.splice(target, patch.index, patch.deleteCount, patch.insert);
	}
	return target;
}

shapeReflections = {
	/**
	 * @function {Object, function(*), [Object]} can-reflect.each each
	 * @parent can-reflect/shape
	 * @description  Iterate a List-like or Map-like, calling `callback` on each keyed or indexed property
	 *
	 * @signature `each(obj, callback, context)`
	 *
	 * If `obj` is a List-like or an Iterator-like, `each` functions as [can-reflect.eachIndex eachIndex],
	 * iterating over numeric indexes from 0 to `obj.length - 1` and calling `callback` with each property and
	 * index, optionally with `context` as `this` (defaulting to `obj`).  If not, `each` functions as
	 * [can-reflect.eachKey eachKey],
	 * iterating over every key on `obj` and calling `callback` on each one.
	 *
	 * ```js
	 * var foo = new DefineMap({ bar: "baz" });
	 * var quux = new DefineList([ "thud", "jeek" ]);
	 *
	 * canReflect.each(foo, console.log, console); // -> logs 'baz bar {foo}'
	 * canReflect.each(quux, console.log, console); // -> logs 'thud 0 {quux}'; logs 'jeek 1 {quux}'
	 * ```
	 *
	 * @param  {Object}   obj     The object to iterate over
	 * @param  {Function(*, ValueLike)} callback a function that receives each item in the ListLike or MapLike
	 * @param  {[Object]}   context  an optional `this` context for calling the callback
	 * @return {Array} the result of calling [can-reflect.eachIndex `eachIndex`] if `obj` is a ListLike,
	 * or [can-reflect.eachKey `eachKey`] if a MapLike.
	 */
	each: function(obj, callback, context){

		// if something is more "list like" .. use eachIndex
		if(typeReflections.isIteratorLike(obj) || typeReflections.isMoreListLikeThanMapLike(obj) ) {
			return shapeReflections.eachIndex(obj,callback,context);
		} else {
			return shapeReflections.eachKey(obj,callback,context);
		}
	},

	/**
	 * @function {ListLike, function(*), [Object]} can-reflect.eachIndex eachIndex
	 * @parent can-reflect/shape
	 * @description  Iterate a ListLike calling `callback` on each numerically indexed element
	 *
	 * @signature `eachIndex(list, callback, context)`
	 *
	 * For each numeric index from 0 to `list.length - 1`, call `callback`, passing the current
	 * property value, the current index, and `list`, and optionally setting `this` as `context`
	 * if specified (otherwise use the current property value).
	 *
	 * ```js
	 * var foo = new DefineList([ "bar", "baz" ]);
	 *
	 * canReflect.eachIndex(foo, console.log, console); // -> logs 'bar 0 {foo}'; logs 'baz 1 {foo}'
	 * ```
	 *
	 * @param  {ListLike}   list     The list to iterate over
	 * @param  {Function(*, Number)} callback a function that receives each item
	 * @param  {[Object]}   context  an optional `this` context for calling the callback
	 * @return {ListLike}   the original list
	 */
	eachIndex: function(list, callback, context){
		// each index in something list-like. Uses iterator if it has it.
		if(Array.isArray(list)) {
			return shapeReflections.eachListLike(list, callback, context);
		} else {
			var iter, iterator = list[canSymbol.iterator];
			if(typeReflections.isIteratorLike(list)) {
				// we are looping through an iterator
				iter = list;
			} else if(iterator) {
				iter = iterator.call(list);
			}
			// fast-path arrays
			if(iter) {
				var res, index = 0;

				while(!(res = iter.next()).done) {
					if( callback.call(context || list, res.value, index++, list) === false ){
						break;
					}
				}
			} else {
				shapeReflections.eachListLike(list, callback, context);
			}
		}
		return list;
	},
	eachListLike: function(list, callback, context){
		var index = -1;
		var length = list.length;
		if( length === undefined ) {
			var size = list[sizeSymbol];
			if(size) {
				length = size.call(list);
			} else {
				throw new Error("can-reflect: unable to iterate.");
			}
		}

		while (++index < length) {
			var item = list[index];
			if (callback.call(context || item, item, index, list) === false) {
				break;
			}
		}

		return list;
	},
	/**
	 * @function can-reflect.toArray toArray
	 * @parent can-reflect/shape
	 * @description  convert the values of any MapLike or ListLike into an array
	 *
	 * @signature `toArray(obj)`
	 *
	 * Convert the values of any Map-like or List-like into a JavaScript Array.  If a Map-like,
	 * key data is discarded and only value data is preserved.
	 *
	 * ```js
	 * var foo = new DefineList(["bar", "baz"]);
	 * var quux = new DefineMap({ thud: "jeek" });
	 * ```
	 *
	 * canReflect.toArray(foo); // -> ["bar", "baz"]
	 * canReflect.toArray(quux): // -> ["jeek"]
	 *
	 * @param  {Object} obj Any object, whether MapLike or ListLike
	 * @return {Array}  an array of the values of `obj`
	 */
	toArray: function(obj){
		var arr = [];
		shapeReflections.each(obj, function(value){
			arr.push(value);
		});
		return arr;
	},
	/**
	 * @function can-reflect.eachKey eachKey
	 * @parent can-reflect/shape
	 * @description Iterate over a MapLike, calling `callback` on each enumerable property
	 *
	 * @signature `eachKey(obj, callback, context)`
	 *
	 * Iterate all own enumerable properties on Map-like `obj`
	 * (using [can-reflect/shape/getOwnEnumerableKeys canReflect.getOwnEnumerableKeys]), and call
	 * `callback` with the property value, the property key, and `obj`, and optionally setting
	 * `this` on the callback as `context` if provided, `obj` otherwise.
	 *
	 * ```js
	 * var foo = new DefineMap({ bar: "baz" });
	 *
	 * canReflect.eachKey(foo, console.log, console); // logs 'baz bar {foo}'
	 * ```
	 *
	 * @param  {Object}   obj   The object to iterate over
	 * @param  {Function(*, String)} callback The callback to call on each enumerable property value
	 * @param  {[Object]}   context  an optional `this` context for calling `callback`
	 * @return {Array}    the enumerable keys of `obj` as an Array
	 */
	eachKey: function(obj, callback, context){
		// each key in something map like
		// eachOwnEnumerableKey
		if(obj) {
			var enumerableKeys = shapeReflections.getOwnEnumerableKeys(obj);

			// cache getKeyValue method if we can
			var getKeyValue = obj[getKeyValueSymbol] || shiftedGetKeyValue;

			return shapeReflections.eachIndex(enumerableKeys, function(key){
				var value = getKeyValue.call(obj, key);
				return callback.call(context || obj, value, key, obj);
			});
		}
		return obj;
	},
	/**
	 * @function can-reflect.hasOwnKey hasOwnKey
	 * @parent can-reflect/shape
	 * @description  Determine whether an object contains a key on itself, not only on its prototype chain
	 *
	 * @signature `hasOwnKey(obj, key)`
	 *
	 * Return `true` if an object's own properties include the property key `key`, `false` otherwise.
	 * An object may implement [can-symbol/symbols/hasOwnKey @@@@can.hasOwnKey] to override default behavior.
	 * By default, `canReflect.hasOwnKey` will first look for
	 * [can-symbol/symbols/getOwnKey @@@@can.getOwnKey] on `obj`. If present, it will call `@@@@can.getOwnKey` and
	 * test `key` against the returned Array of keys.  If absent, `Object.prototype.hasOwnKey()` is used.
	 *
	 * ```js
	 * var foo = new DefineMap({ "bar": "baz" });
	 *
	 * canReflect.hasOwnKey(foo, "bar"); // -> true
	 * canReflect.hasOwnKey(foo, "each"); // -> false
	 * foo.each // -> function each() {...}
	 * ```
	 *
	 * @param  {Object} obj Any MapLike object
	 * @param  {String} key The key to look up on `obj`
	 * @return {Boolean} `true` if `obj`'s key set contains `key`, `false` otherwise
	 */
	"hasOwnKey": function(obj, key){
		// if a key or index
		// like has own property
		var hasOwnKey = obj[canSymbol.for("can.hasOwnKey")];
		if(hasOwnKey) {
			return hasOwnKey.call(obj, key);
		}
		var getOwnKeys = obj[canSymbol.for("can.getOwnKeys")];
		if( getOwnKeys ) {
			var found = false;
			shapeReflections.eachIndex(getOwnKeys.call(obj), function(objKey){
				if(objKey === key) {
					found = true;
					return false;
				}
			});
			return found;
		}
		return hasOwnProperty.call(obj, key);
	},
	/**
	 * @function can-reflect.getOwnEnumerableKeys getOwnEnumerableKeys
	 * @parent can-reflect/shape
	 * @description Return the list of keys which can be iterated over on an object
	 *
	 * @signature `getOwnEnumerableKeys(obj)`
	 *
	 * Return all keys on `obj` which have been defined as enumerable, either from explicitly setting
	 * `enumerable` on the property descriptor, or by using `=` to set the value of the property without
	 * a key descriptor, but excluding properties that only exist on `obj`'s prototype chain.  The
	 * default behavior can be overridden by implementing
	 * [can-symbol/symbols/getOwnEnumerableKeys @@@@can.getOwnEnumerableKeys] on `obj`.  By default,
	 * `canReflect.getOwnEnumerableKeys` will use [can-symbol/symbols/getOwnKeys @@@@can.getOwnKeys] to
	 * retrieve the set of keys and [can-symbol/symbols/getOwnKeyDescriptor @@@@can.getOwnKeyDescriptor]
	 * to filter for those which are enumerable.  If either symbol is absent from `obj`, `Object.keys`
	 * is used.
	 *
	 * ```js
	 * var foo = new DefineMap({ bar: "baz", [canSymbol.for("quux")]: "thud" });
	 * Object.defineProperty(foo, "jeek", {
	 *   enumerable: true,
	 *   value: "plonk"
	 * });
	 *
	 * canReflect.getOwnEnumerableKeys(foo); // -> ["bar", "jeek"]
	 * ```
	 *
	 * @param  {Object} obj Any Map-like object
	 * @return {Array} the Array of all enumerable keys from the object, either using
	 * [can-symbol/symbols/getOwnEnumerableKeys `@@@@can.getOwnEnumerableKeys`] from `obj`, or filtering
	 * `obj`'s own keys for those which are enumerable.
	 */
	getOwnEnumerableKeys: function(obj){
		// own enumerable keys (aliased as keys)
		var getOwnEnumerableKeys = obj[canSymbol.for("can.getOwnEnumerableKeys")];
		if(getOwnEnumerableKeys) {
			return getOwnEnumerableKeys.call(obj);
		}
		if( obj[canSymbol.for("can.getOwnKeys")] && obj[canSymbol.for("can.getOwnKeyDescriptor")] ) {
			var keys = [];
			shapeReflections.eachIndex(shapeReflections.getOwnKeys(obj), function(key){
				var descriptor =  shapeReflections.getOwnKeyDescriptor(obj, key);
				if(descriptor.enumerable) {
					keys.push(key);
				}
			}, this);

			return keys;
		} /*else if(obj[canSymbol.iterator]){
			var iter = obj[canSymbol.iterator](obj);
			var index = 0;
			var keys;
			return {
				next: function(){
					var res = iter.next();
					if(index++)
				}
			}
			while(!().done) {

				if( callback.call(context || list, res.value, index++, list) === false ){
					break;
				}
			}
		}*/ else {
			return Object_Keys(obj);
		}
	},
	/**
	 * @function can-reflect.getOwnKeys getOwnKeys
	 * @parent can-reflect/shape
	 * @description Return the list of keys on an object, whether or not they can be iterated over
	 *
	 * @signature `getOwnKeys(obj)`
	 *
	 * Return the Array of all String (not Symbol) keys from `obj`, whether they are enumerable or not.  If
	 * [can-symbol/symbols/getOwnKeys @@@@can.getOwnKeys] exists on `obj`, it is called to return
	 * the keys; otherwise, `Object.getOwnPropertyNames()` is used.
	 *
	 * ```js
	 * var foo = new DefineMap({ bar: "baz", [canSymbol.for("quux")]: "thud" });
	 * Object.defineProperty(foo, "jeek", {
	 *   enumerable: false,
	 *   value: "plonk"
	 * });
	 *
	 * canReflect.getOwnKeys(foo); // -> ["bar", "jeek"]
	 * ```
	 *
	 * @param  {Object} obj Any MapLike object
	 * @return {Array} the Array of all String keys from the object.
	 */
	getOwnKeys: function(obj){
		// own enumerable&non-enumerable keys (Object.getOwnPropertyNames)
		var getOwnKeys = obj[canSymbol.for("can.getOwnKeys")];
		if(getOwnKeys) {
			return getOwnKeys.call(obj);
		} else {
			return Object.getOwnPropertyNames(obj);
		}
	},
	/**
	 * @function can-reflect.getOwnKeyDescriptor getOwnKeyDescriptor
	 * @parent can-reflect/shape
	 * @description Return a property descriptor for a named property on an object.
	 *
	 * @signature `getOwnKeyDescriptor(obj, key)`
	 *
	 *	Return the key descriptor for the property key `key` on the Map-like object `obj`. A key descriptor
	 *	is specified in ECMAScript 5 and contains keys for the property's `configurable` and `enumerable` states,
	 *	as well as either `value` and `writable` for value properties, or `get` and `set` for getter/setter properties.
	 *
	 * The default behavior can be overridden by implementing [can-symbol/symbols/getOwnKeyDescriptor @@@@can.getOwnKeyDescriptor]
	 * on `obj`; otherwise the default is to call `Object.getOwnKeyDescriptor()`.
	 *
	 * ```js
	 * var foo = new DefineMap({ bar: "baz" });
	 *
	 * getOwnKeyDescriptor(foo, "bar"); // -> {configurable: true, writable: true, enumerable: true, value: "baz"}
	 * ```
	 *
	 * @param  {Object} obj Any object with named properties
	 * @param  {String} key The property name to look up on `obj`
	 * @return {Object}   A key descriptor object
	 */
	getOwnKeyDescriptor: function(obj, key){
		var getOwnKeyDescriptor = obj[canSymbol.for("can.getOwnKeyDescriptor")];
		if(getOwnKeyDescriptor) {
			return getOwnKeyDescriptor.call(obj, key);
		} else {
			return Object.getOwnPropertyDescriptor(obj, key);
		}
	},
	/**
	 * @function can-reflect.unwrap unwrap
	 * @parent can-reflect/shape
	 * @description Unwraps a map-like or array-like value into an object or array.
	 *
	 *
	 * @signature `unwrap(obj)`
	 *
	 * Recursively unwraps a map-like or list-like object.
	 *
	 * ```js
	 * import canReflect from "can-reflect";
	 *
	 * var map = new DefineMap({foo: "bar"});
	 * canReflect.unwrap(map) //-> {foo: "bar"}
	 * ```
	 *
	 * `unwrap` is similar to [can-reflect.serialize] except it does not try to provide `JSON.stringify()`-safe
	 * objects.  For example, an object with a `Date` instance property value will not be expected to
	 * serialize the date instance:
	 *
	 * ```js
	 * var date = new Date();
	 * var map = new DefineMap({date: date});
	 * canReflect.unwrap(map) //-> {date: date}
	 * ```
	 *
	 * @param {Object} obj A map-like or array-like object.
	 * @return {Object} Returns objects and arrays.
	 */
	unwrap: makeSerializer("unwrap",[canSymbol.for("can.unwrap")]),
	/**
	 * @function can-reflect.serialize serialize
	 * @parent can-reflect/shape
	 * @description Serializes an object to a value that can be passed to JSON.stringify.
	 *
	 *
	 * @signature `serialize(obj)`
	 *
	 * Recursively serializes a map-like or list-like object.
	 *
	 * ```js
	 * import canReflect from "can-reflect";
	 * canReflect.serialize({foo: "bar"}) //-> {foo: "bar"}
	 * ```
	 *
	 * It does this by recursively:
	 *
	 *  - Checking if `obj` is a primitive, if it is, returns the value.
	 *  - If `obj` is an object:
	 *    - calling the `@can.serialize` property on the value if it exists.
	 *    - If the `@can.serialize` value doesn't exist, walks through every key-value
	 *      on `obj` and copy to a new object.
	 *
	 * @param {Object} obj A map-like or array-like object.
	 * @return {Object} Returns a plain object or array.
	 */
	serialize: makeSerializer("serialize",[canSymbol.for("can.serialize"), canSymbol.for("can.unwrap")]),

	assignMap: function(target, source) {
		// read each key and set it on target
		var hasOwnKey = fastHasOwnKey(target);
		var getKeyValue = target[getKeyValueSymbol] || shiftedGetKeyValue;
		var setKeyValue = target[setKeyValueSymbol] || shiftedSetKeyValue;
		shapeReflections.eachKey(source,function(value, key){
			// if the target doesn't have this key or the keys are not the same
			if(!hasOwnKey(key) || getKeyValue.call(target, key) !==  value) {
				setKeyValue.call(target, key, value);
			}
		});
		return target;
	},
	assignList: function(target, source) {
		var inserting = shapeReflections.toArray(source);
		getSetReflections.splice(target, 0, inserting, inserting );
		return target;
	},
	/**
	 * @function can-reflect.assign assign
	 * @parent can-reflect/shape
	 * @description Assign one objects values to another
	 *
	 * @signature `.assign(target, source)`
	 *
	 * Copies the values (and properties if map-like) from `source` onto `target`.
	 *
	 * For map-like objects, every enumerable property on `target` is copied:
	 *
	 * ```js
	 * var target = {};
	 * var source = {key : "value"};
	 * var restult = canReflect.assign(target, source);
	 * result === target //-> true
	 * target //-> {key : "value"}
	 * ```
	 *
	 * For Arrays, enumerated values are copied over, but the length of the array will not be
	 * trunkated.  Use [can-reflect.update] for trunkating.
	 *
	 * ```js
	 * var target = ["a","b","c"];
	 * var source = ["A","B"];
	 * canReflect.assign(target, source);
	 * target //-> ["A","B","c"]
	 * ```
	 *
	 * @param  {Object} target The value that will be updated with `source`'s values.
	 * @param  {Object} source A source of values to copy to `target`.
	 * @return {Object} The target.
	 */
	assign: function(target, source) {
		if(typeReflections.isIteratorLike(source) || typeReflections.isMoreListLikeThanMapLike(source) ) {
			// copy to array and add these keys in place
			shapeReflections.assignList(target, source);
		} else {
			shapeReflections.assignMap(target, source);
		}
		return target;
	},
	assignDeepMap: function(target, source) {

		var hasOwnKey = fastHasOwnKey(target);
		var getKeyValue = target[getKeyValueSymbol] || shiftedGetKeyValue;
		var setKeyValue = target[setKeyValueSymbol] || shiftedSetKeyValue;

		shapeReflections.eachKey(source, function(newVal, key){
			if(!hasOwnKey(key)) {
				// set no matter what
				getSetReflections.setKeyValue(target, key, newVal);
			} else {
				var curVal = getKeyValue.call(target, key);

				// if either was primitive, no recursive update possible
				if(newVal === curVal) {
					// do nothing
				} else if(typeReflections.isPrimitive(curVal) || typeReflections.isPrimitive(newVal) || shouldUpdateOrAssign(curVal) === false ) {
					setKeyValue.call(target, key, newVal);
				} else {
					shapeReflections.assignDeep(curVal, newVal);
				}
			}
		}, this);
		return target;
	},
	assignDeepList: function(target, source) {
		return updateDeepList.call(this, target, source, true);
	},
	/**
	 * @function can-reflect.assignDeep assignDeep
	 * @parent can-reflect/shape
	 * @description Assign one objects values to another, and performs the same action for all child values.
	 *
	 * @signature `.assignDeep(target, source)`
	 *
	 * Copies the values (and properties if map-like) from `source` onto `target` and repeates for all child
	 * values.
	 *
	 * For map-like objects, every enumerable property on `target` is copied:
	 *
	 * ```js
	 * var target = {name: {first: "Justin"}};
	 * var source = {name: {last: "Meyer"}};
	 * var restult = canReflect.assignDeep(target, source);
	 * target //->  {name: {first: "Justin", last: "Meyer"}}
	 * ```
	 *
	 * An object can control the behavior of `assignDeep` using the [can-symbol/symbols/assignDeep] symbol.
	 *
	 * @param  {Object} target The value that will be updated with `source`'s values.
	 * @param  {Object} source A source of values to copy to `target`.
	 * @return {Object} The target.
	 */
	assignDeep: function(target, source){
		var assignDeep = target[canSymbol.for("can.assignDeep")];
		if(assignDeep) {
			assignDeep.call(target, source);
		} else if( typeReflections.isMoreListLikeThanMapLike(source) ) {
			// list-like
			shapeReflections.assignDeepList(target, source);
		} else {
			// map-like
			shapeReflections.assignDeepMap(target, source);
		}
		return target;
	},
	updateMap: function(target, source) {
		var sourceKeyMap = makeMap( shapeReflections.getOwnEnumerableKeys(source) );

		var sourceGetKeyValue = source[getKeyValueSymbol] || shiftedGetKeyValue;
		var targetSetKeyValue = target[setKeyValueSymbol] || shiftedSetKeyValue;

		shapeReflections.eachKey(target, function(curVal, key){
			if(!sourceKeyMap.get(key)) {
				getSetReflections.deleteKeyValue(target, key);
				return;
			}
			sourceKeyMap.set(key, false);
			var newVal = sourceGetKeyValue.call(source, key);

			// if either was primitive, no recursive update possible
			if(newVal !== curVal) {
				targetSetKeyValue.call(target, key, newVal);
			}
		}, this);

		shapeReflections.eachIndex(sourceKeyMap.keys(), function(key){
			if(sourceKeyMap.get(key)) {
				targetSetKeyValue.call(target, key, sourceGetKeyValue.call(source, key) );
			}
		});

		return target;
	},
	updateList: function(target, source) {
		var inserting = shapeReflections.toArray(source);

		getSetReflections.splice(target, 0, target, inserting );
		return target;
	},
	/**
	 * @function can-reflect.update update
	 * @parent can-reflect/shape
	 * @description Updates the values of an object match the values of an other object.
	 *
	 * @signature `.update(target, source)`
	 *
	 * Updates the values (and properties if map-like) of `target` to match the values of `source`.
	 * Properties of `target` that are not on `source` will be removed. This does
	 * not recursively update.  For that, use [can-reflect.updateDeep].
	 *
	 * For map-like objects, every enumerable property on `target` is copied:
	 *
	 * ```js
	 * var target = {name: {first: "Justin"}, age: 34};
	 * var source = {name: {last: "Meyer"}};
	 * var result = canReflect.update(target, source);
	 * target //->  {name: {last: "Meyer"}}
	 * ```
	 *
	 * With Arrays all items of the source will be replaced with the new items.
	 *
	 * ```js
	 * var target = ["a","b","c"];
	 * var source = ["A","B"];
	 * canReflect.update(target, source);
	 * target //-> ["A","B"]
	 * ```
	 *
	 * @param  {Object} target The value that will be updated with `source`'s values.
	 * @param  {Object} source A source of values to copy to `target`.
	 * @return {Object} The target.
	 */
	update: function(target, source) {
		if(typeReflections.isIteratorLike(source) || typeReflections.isMoreListLikeThanMapLike(source) ) {
			// copy to array and add these keys in place
			shapeReflections.updateList(target, source);
		} else {
			shapeReflections.updateMap(target, source);
		}
		return target;
	},
	updateDeepMap: function(target, source) {
		var sourceKeyMap = makeMap( shapeReflections.getOwnEnumerableKeys(source) );

		var sourceGetKeyValue = source[getKeyValueSymbol] || shiftedGetKeyValue;
		var targetSetKeyValue = target[setKeyValueSymbol] || shiftedSetKeyValue;

		shapeReflections.eachKey(target, function(curVal, key){

			if(!sourceKeyMap.get(key)) {
				getSetReflections.deleteKeyValue(target, key);
				return;
			}
			sourceKeyMap.set(key, false);
			var newVal = sourceGetKeyValue.call(source, key);

			// if either was primitive, no recursive update possible
			if(typeReflections.isPrimitive(curVal) || typeReflections.isPrimitive(newVal) || shouldUpdateOrAssign(curVal) === false ) {
				targetSetKeyValue.call(target, key, newVal);
			} else {
				shapeReflections.updateDeep(curVal, newVal);
			}

		}, this);

		shapeReflections.eachIndex(sourceKeyMap.keys(), function(key){
			if(sourceKeyMap.get(key)) {
				targetSetKeyValue.call(target, key, sourceGetKeyValue.call(source, key) );
			}
		});
		return target;
	},
	updateDeepList: function(target, source) {
		return updateDeepList.call(this,target, source);
	},
	/**
	 * @function can-reflect.updateDeep updateDeep
	 * @parent can-reflect/shape
	 * @description Makes the values of an object match the values of an other object including all children values.
	 *
	 * @signature `.updateDeep(target, source)`
	 *
	 * Updates the values (and properties if map-like) of `target` to match the values of `source`.
	 * Removes properties from `target` that are not on `source`.
	 *
	 * For map-like objects, every enumerable property on `target` is copied:
	 *
	 * ```js
	 * var target = {name: {first: "Justin"}, age: 34};
	 * var source = {name: {last: "Meyer"}};
	 * var result = canReflect.updateDeep(target, source);
	 * target //->  {name: {last: "Meyer"}}
	 * ```
	 *
	 * An object can control the behavior of `updateDeep` using the [can-symbol/symbols/updateDeep] symbol.
	 *
	 * For list-like objects, a diff and patch strategy is used.  This attempts to limit the number of changes.
	 *
	 * @param  {Object} target The value that will be updated with `source`'s values.
	 * @param  {Object} source A source of values to copy to `target`.
	 * @return {Object} The target.
	 */
	updateDeep: function(target, source){
		var updateDeep = target[canSymbol.for("can.updateDeep")];
		if(updateDeep) {
			updateDeep.call(target, source);
		} else if( typeReflections.isMoreListLikeThanMapLike(source) ) {
			// list-like
			shapeReflections.updateDeepList(target, source);
		} else {
			// map-like
			shapeReflections.updateDeepMap(target, source);
		}
		return target;
	},
	// walks up the whole prototype chain
	/**
	 * @function can-reflect.hasKey hasKey
	 * @parent can-reflect/shape
	 * @description Determine whether an object contains a key on itself or its prototype chain
	 *
	 * @signature `hasKey(obj, key)`
	 *
	 * Return `true` if an object's properties include the property key `key` or an object on its prototype
	 * chain's properties include the key `key`, `false` otherwise.
	 * An object may implement [can-symbol/symbols/hasKey @@@@can.hasKey] to override default behavior.
	 * By default, `canReflect.hasKey` will use [can-reflect.hasOwnKey] and return true if the key is present.
	 * If `hasOwnKey` returns false, the [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/in in Operator] will be used.
	 *
	 * ```js
	 * var foo = new DefineMap({ "bar": "baz" });
	 *
	 * canReflect.in(foo, "bar"); // -> true
	 * canReflect.in(foo, "each"); // -> true
	 * foo.each // -> function each() {...}
	 * ```
	 *
	 * @param  {Object} obj Any MapLike object
	 * @param  {String} key The key to look up on `obj`
	 * @return {Boolean} `true` if `obj`'s key set contains `key` or an object on its prototype chain's key set contains `key`, `false` otherwise
	 */
	hasKey: function(obj, key) {
		if( obj == null ) {
			return false;
		}
		if (typeReflections.isPrimitive(obj)) {
			if (hasOwnProperty.call(obj, key)) {
				return true;
			} else {
				var proto;
				if(getPrototypeOfWorksWithPrimitives) {
					proto = Object.getPrototypeOf(obj);
				} else {
					// IE-remove-start
					proto = obj.__proto__; // jshint ignore:line
					// IE-remove-end
				}
				if(proto !== undefined) {
					return key in proto;
				} else {
					// IE-remove-start
					return obj[key] !== undefined;
					// IE-remove-end
				}
			}
		}
		var hasKey = obj[canSymbol.for("can.hasKey")];
		if(hasKey) {
			return hasKey.call(obj, key);
		}

		var found = shapeReflections.hasOwnKey(obj, key);

		return found || key in obj;
	},
	getAllEnumerableKeys: function(){},
	getAllKeys: function(){},
	/**
	 * @function can-reflect.assignSymbols assignSymbols
	 * @parent can-reflect/shape
	 * @description Assign well known symbols and values to an object.
	 *
	 * @signature `.assignSymbols(target, source)`
	 *
	 * Converts each property name on the `source` object to a [can-symbol.for well known symbol]
	 * and uses that symbol to set the corresponding value on target.
	 *
	 * This is used to easily set symbols correctly even when symbol isn't natively supported.
	 *
	 * ```js
	 * canReflect.assignSymbols(Map.prototype, {
	 *   "can.getKeyValue": Map.prototype.get
	 * })
	 * ```
	 *
	 * If a `source` property name matches a symbol on `Symbol` (like `iterator` on `Symbol.iterator`),
	 * that symbol will be used:
	 *
	 * ```js
	 * canReflect.assignSymbols(ArrayLike.prototype, {
	 *   "iterator": function() { ... }
	 * })
	 * ArrayLike.prototype[Symbol.iterator] = function(){ ... }
	 * ```
	 *
	 * @param  {Object} target The value that will be updated with `source`'s symbols and values.
	 * @param  {Object<name,value>} source A source of symbol names and values to copy to `target`.
	 * @return {Object} The target.
	 */
	assignSymbols: function(target, source){
		shapeReflections.eachKey(source, function(value, key){
			var symbol = typeReflections.isSymbolLike(canSymbol[key]) ? canSymbol[key] : canSymbol.for(key);
			getSetReflections.setKeyValue(target, symbol, value);
		});
		return target;
	},
	isSerialized: isSerializedHelper,
	/**
	 * @function can-reflect.size size
	 * @parent can-reflect/shape
	 * @description Return the number of items in the collection.
	 *
	 * @signature `.size(target)`
	 *
	 * Returns the number of items contained in `target`. Target can
	 * provide the size using the [can-symbol/symbols/size] symbol.
	 *
	 * If the `target` has a numeric `length` property that is greater than or equal to 0, that
	 * `length` will be returned.
	 *
	 * ```js
	 * canReflect.size([1,2,3]) //-> 3
	 * ```
	 *
	 * If the `target` is [can-reflect.isListLike], the values of the list will be counted.
	 *
	 * If the `target` is a plain JS object, the number of enumerable properties will be returned.
	 *
	 * ```js
	 * canReflect.size({foo:"bar"}) //-> 1
	 * ```
	 *
	 * If the `target` is anything else, `undefined` is returned.
	 *
	 * @param  {Object} target The container object.
	 * @return {Number} The number of values in the target.
	 */
	size: function(obj){
		if(obj == null) {
			return 0;
		}
		var size = obj[sizeSymbol];
		var count = 0;
		if(size) {
			return size.call(obj);
		}
		else if(helpers.hasLength(obj)){
			return obj.length;
		}
		else if(typeReflections.isListLike(obj)){

			shapeReflections.eachIndex(obj, function(){
				count++;
			});
			return count;
		}
		else if( obj ) {
			return shapeReflections.getOwnEnumerableKeys(obj).length;
		}
		else {
			return undefined;
		}
	},
	/**
	 * @function {Function, String|Symbol, Object} can-reflect.defineInstanceKey defineInstanceKey
	 * @parent can-reflect/shape
	 * @description Create a key for all instances of a constructor.
	 *
	 * @signature `defineInstanceKey(cls, key, properties)`
	 *
	 * Define the property `key` on the prototype of the constructor `cls` using the symbolic
	 * property [can-symbol/symbols/defineInstanceKey @@can.defineInstanceKey] if it exists; otherwise
	 * use `Object.defineProperty()` to define the property.  The property definition
	 *
	 * @param  {Function} cls  a Constructor function
	 * @param  {String} key     the String or Symbol key to set.
	 * @param  {Object} properties a JavaScript property descriptor
	 */
	defineInstanceKey: function(cls, key, properties) {
		var defineInstanceKey = cls[canSymbol.for("can.defineInstanceKey")];
		if(defineInstanceKey) {
			return defineInstanceKey.call(cls, key, properties);
		}
		var proto = cls.prototype;
		defineInstanceKey = proto[canSymbol.for("can.defineInstanceKey")];
		if(defineInstanceKey) {
			defineInstanceKey.call(proto, key, properties);
		} else {
			Object.defineProperty(
				proto,
				key,
				shapeReflections.assign({
					configurable: true,
					enumerable: !typeReflections.isSymbolLike(key),
					writable: true
				}, properties)
			);
		}
	}
};

shapeReflections.isSerializable = shapeReflections.isSerialized;
shapeReflections.keys = shapeReflections.getOwnEnumerableKeys;
module.exports = shapeReflections;
