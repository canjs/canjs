"use strict";
var canSymbol = require("can-symbol");
var typeReflections = require("../type/type");

var getNameSymbol = canSymbol.for("can.getName");

/**
 * @function {Object, String} can-reflect.setName setName
 * @parent can-reflect/shape
 * @description Set a human-readable name of an object.
 *
 * @signature `setName(obj, value)`
 *
 * ```js
 * var f = function() {};
 *
 * canReflect.setName(f, "myFunction")
 * f.name //-> "myFunction"
 * ```
 *
 * @param {Object} obj   the object to set on
 * @param {String} value the value to set for the object
 */
function setName(obj, nameGetter) {
	if (typeof nameGetter !== "function") {
		var value = nameGetter;
		nameGetter = function() {
			return value;
		};
	}

	Object.defineProperty(obj, getNameSymbol, {
		value: nameGetter
	});
}

/**
 * @function {Object} can-reflect.getName getName
 * @parent can-reflect/shape
 * @description Get the name of an object.
 *
 * @signature `getValue(obj)`
 *
 * @body
 *
 * The [@@@can.getName](can-symbol/symbols/getName.html) symbol is used to
 * provide objects human readable names; the main goal of these names is to help
 * users get a glance of what the object does and what it is used for.
 *
 * There are no hard rules to define names but CanJS uses the following convention
 * for consistent names across its observable types:
 *
 * - The name starts with the observable constructor name
 * - The constructor name is decorated with the following characters based on its type:
 *		- `<>`: for [value-like](can-reflect.isValueLike.html) observables, e.g: `SimpleObservable<>`
 *		- `[]`: for [list-like](can-reflect.isListLike.html) observables, e.g: `DefineList[]`
 *		- `{}`: for [map-like](can-reflect.isMapLike.html) observables, e.g: `DefineMap{}`
 * - Any property that makes the instance unique (like ids) are printed inside
 *    the chars mentioned before.
 *
 * The example below shows how to implement [@@@can.getName](can-symbol/symbols/getName.html),
 * in a value-like observable (similar to [can-simple-observable]).
 *
 * ```js
 * var canReflect = require("can-reflect");
 *
 * function MySimpleObservable(value) {
 *		this.value = value;
 * }
 *
 * canReflect.assignSymbols(MySimpleObservable.prototype, {
 *		"can.getName": function() {
 *			//!steal-remove-start
 *			if (process.env.NODE_ENV !== 'production') {
 *				var value = JSON.stringify(this.value);
 *				return canReflect.getName(this.constructor) + "<" + value + ">";
 *			}
 *			//!steal-remove-end
 *		}
 * });
 * ```
 *
 * With that in place, `MySimpleObservable` can be used like this:
 *
 * ```js
 * var one = new MySimpleObservable(1);
 * canReflect.getName(one); // MySimpleObservable<1>
 * ```
 *
 * @param  {Object} obj The object to get from
 * @return {String} The human-readable name of the object
 */
var anonymousID = 0;
function getName(obj) {
	var type = typeof obj;
	if(obj === null || (type !== "object" && type !== "function")) {
		return ""+obj;
	}
	var nameGetter = obj[getNameSymbol];
	if (nameGetter) {
		return nameGetter.call(obj);
	}

	if (type === "function") {
		if (!("name" in obj)) {
			// IE doesn't support function.name natively
			obj.name = "functionIE" + anonymousID++;
		}
		return obj.name;
	}

	if (obj.constructor && obj !== obj.constructor) {
		var parent = getName(obj.constructor);
		if (parent) {
			if (typeReflections.isValueLike(obj)) {
				return parent + "<>";
			}

			if (typeReflections.isMoreListLikeThanMapLike(obj)) {
				return parent + "[]";
			}

			if (typeReflections.isMapLike(obj)) {
				return parent + "{}";
			}
		}
	}

	return undefined;
}

module.exports = {
	setName: setName,
	getName: getName
};
