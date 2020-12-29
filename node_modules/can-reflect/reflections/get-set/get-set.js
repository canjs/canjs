"use strict";
var canSymbol = require("can-symbol");
var typeReflections = require("../type/type");

var setKeyValueSymbol = canSymbol.for("can.setKeyValue"),
	getKeyValueSymbol = canSymbol.for("can.getKeyValue"),
	getValueSymbol = canSymbol.for("can.getValue"),
	setValueSymbol = canSymbol.for("can.setValue");

var reflections = {
	/**
	 * @function {Object, String, *} can-reflect.setKeyValue setKeyValue
	 * @parent can-reflect/get-set
	 * @description Set the value of a named property on a MapLike object.
	 *
	 * @signature `setKeyValue(obj, key, value)`
	 *
	 * Set the property on Map-like `obj`, identified by the String, Symbol or Object value `key`, to the value `value`.
	 * The default behavior can be overridden on `obj` by implementing [can-symbol/symbols/setKeyValue @@@@can.setKeyValue],
	 * otherwise native named property access is used for string keys, and `Object.defineProperty` is used to set symbols.
	 *
	 * ```js
	 * var foo = new DefineMap({ bar: "baz" });
	 *
	 * canReflect.setKeyValue(foo, "bar", "quux");
	 * foo[bar]; // -> "quux"
	 * ```
	 * @param  {Object} obj   the object to set on
	 * @param  {String} key   the key for the property to set
	 * @param  {*} value      the value to set on the object
	 */
	setKeyValue: function(obj, key, value){
		if( typeReflections.isSymbolLike(key) ) {
			if(typeof key === "symbol") {
				obj[key] = value;
			} else {
				Object.defineProperty(obj, key, {
					enumerable: false,
					configurable: true,
					value: value,
					writable: true
				});
			}
			return;
		}
		var setKeyValue = obj[setKeyValueSymbol];
		if(setKeyValue !== undefined) {
			return setKeyValue.call(obj, key, value);
		} else {
			obj[key] = value;
		}
	},
	/**
	 * @function {Object, String} can-reflect.getKeyValue getKeyValue
	 * @parent can-reflect/get-set
	 * @description Get the value of a named property on a MapLike object.
	 *
	 * @signature `getKeyValue(obj, key)`
	 *
	 * Retrieve the property on Map-like `obj` identified by the String or Symbol value `key`.  The default behavior
	 * can be overridden on `obj` by implementing [can-symbol/symbols/getKeyValue @@@@can.getKeyValue],
	 * otherwise native named property access is used.
	 *
	 * ```js
	 * var foo = new DefineMap({ bar: "baz" });
	 *
	 * canReflect.getKeyValue(foo, "bar"); // -> "baz"
	 * ```
	 *
	 * @param  {Object} obj   the object to get from
	 * @param  {String} key   the key of the property to get
	 */
	getKeyValue: function(obj, key) {
		var getKeyValue = obj[getKeyValueSymbol];
		if(getKeyValue) {
			return getKeyValue.call(obj, key);
		}
		return obj[key];
	},
	/**
	 * @function {Object, String} can-reflect.deleteKeyValue deleteKeyValue
	 * @parent can-reflect/get-set
	 * @description Delete a named property from a MapLike object.
	 *
	 * @signature `deleteKeyValue(obj, key)`
	 *
	 * Remove the property identified by the String or Symbol `key` from the Map-like object `obj`, if possible.
	 * Property definitions may interfere with deleting key values; the behavior on `obj` if `obj[key]` cannot
	 * be deleted is undefined.  The default use of the native `delete` keyword can be overridden by `obj` if it
	 * implements [can-symbol/symbols/deleteKeyValue @@@@can.deleteKeyValue].
	 *
	 * ```js
	 * var foo = new DefineMap({ bar: "baz" });
	 * var quux = new CanMap({ thud: "jeek" });
	 *
	 * canReflect.deleteKeyValue(foo, "bar");
	 * canReflect.deleteKeyValue(quux, "thud");
	 *
	 * "bar" in foo; // ->  true  -- DefineMaps use property defs which cannot be un-defined
	 * foo.bar // -> undefined    --  but set values to undefined when deleting
	 *
	 * "thud" in quux; // -> false
	 * quux.thud; // -> undefined
	 * ```
	 *
	 * @param  {Object} obj   the object to delete on
	 * @param  {String} key   the key for the property to delete
	 */
	deleteKeyValue: function(obj, key) {
		var deleteKeyValue = obj[canSymbol.for("can.deleteKeyValue")];
		if(deleteKeyValue) {
			return deleteKeyValue.call(obj, key);
		}
		delete obj[key];
	},
	/**
	 * @function {Object} can-reflect.getValue getValue
	 * @parent can-reflect/get-set
	 * @description Get the value of an object with a gettable value
	 *
	 * @signature `getValue(obj)`
	 *
	 * Return the value of the Value-like object `obj`.  Unless `obj` implements
	 * [can-symbol/symbols/getValue @@@@can.getValue], the result of `getValue` on
	 * `obj` will always be `obj`.  Observable Map-like objects may want to implement
	 * `@@@@can.getValue` to return non-observable or plain representations of themselves.
	 *
	 * ```js
	 * var compute = canCompute("foo");
	 * var primitive = "bar";
	 *
	 * canReflect.getValue(compute); // -> "foo"
	 * canReflect.getValue(primitive); // -> "bar"
	 * ```
	 *
	 * @param  {Object} obj   the object to get from
	 * @return {*} the value of the object via `@@can.getValue`, or the value itself.
	 */
	getValue: function(value){
		if(typeReflections.isPrimitive(value)) {
			return value;
		}
		var getValue = value[getValueSymbol];
		if(getValue) {
			return getValue.call(value);
		}
		return value;
	},
	/**
	 * @function {Object, *} can-reflect.setValue setValue
	 * @parent can-reflect/get-set
	 * @description Set the value of a mutable object.
	 *
	 * @signature `setValue(obj, value)`
	 *
	 * Set the value of a Value-like object `obj` to the value `value`.  `obj` *must* implement
	 * [can-symbol/symbols/setValue @@@@can.setValue] to be used with `canReflect.setValue`.
	 * Map-like objects may want to implement `@@@@can.setValue` to merge objects of properties
	 * into themselves.
	 *
	 * ```js
	 * var compute = canCompute("foo");
	 * var plain = {};
	 *
	 * canReflect.setValue(compute, "bar");
	 * compute(); // -> bar
	 *
	 * canReflect.setValue(plain, { quux: "thud" }); // throws "can-reflect.setValue - Can not set value."
	 * ```
	 *
	 * @param  {Object} obj   the object to set on
	 * @param  {*} value      the value to set for the object
	 */
	setValue: function(item, value){
		var setValue = item && item[setValueSymbol];
		if(setValue) {
			return setValue.call(item, value);
		} else {
			throw new Error("can-reflect.setValue - Can not set value.");
		}
	},

	splice: function(obj, index, removing, adding){
		var howMany;
		if(typeof removing !== "number") {
			var updateValues = obj[canSymbol.for("can.updateValues")];
			if(updateValues) {
				return updateValues.call(obj, index, removing, adding);
			}
			howMany = removing.length;
		} else {
			howMany = removing;
		}

		if(arguments.length <= 3){
			adding = [];
		}

		var splice = obj[canSymbol.for("can.splice")];
		if(splice) {
			return splice.call(obj, index, howMany, adding);
		}
		return [].splice.apply(obj, [index, howMany].concat(adding) );
	},
	addValues: function(obj, adding, index) {
		var add = obj[canSymbol.for("can.addValues")];
		if(add) {
			return add.call(obj, adding, index);
		}
		if(Array.isArray(obj) && index === undefined) {
			return obj.push.apply(obj, adding);
		}
		return reflections.splice(obj, index, [], adding);
	},
	removeValues: function(obj, removing, index) {
		var removeValues = obj[canSymbol.for("can.removeValues")];
		if(removeValues) {
			return removeValues.call(obj, removing, index);
		}
		if(Array.isArray(obj) && index === undefined) {
			removing.forEach(function(item){
				var index = obj.indexOf(item);
				if(index >=0) {
					obj.splice(index, 1);
				}
			});
			return;
		}
		return reflections.splice(obj, index, removing, []);
	}
};
/**
 * @function {Object, String} can-reflect.get get
 * @hide
 * @description an alias for [can-reflect.getKeyValue getKeyValue]
 */
reflections.get = reflections.getKeyValue;
/**
 * @function {Object, String} can-reflect.set set
 * @hide
 * @description an alias for [can-reflect.setKeyValue setKeyValue]
 */
reflections.set = reflections.setKeyValue;
/**
 * @function {Object, String} can-reflect.delete delete
 * @hide
 * @description an alias for [can-reflect.deleteKeyValue deleteKeyValue]
 */
reflections["delete"] = reflections.deleteKeyValue;

module.exports = reflections;
