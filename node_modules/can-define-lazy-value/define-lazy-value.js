"use strict";
/**
 * @module {function} can-define-lazy-value
 * @parent can-js-utilities
 * @collection can-infrastructure
 * @package ./package.json
 * @signature `defineLazyValue(obj, prop, fn, writable)`
 *
 * Use Object.defineProperty to define properties whose values will be created lazily when they are first read.
 *
 * ```js
 * var _id = 1;
 * function getId() {
 *     return _id++;
 * }
 *
 * function MyObj(name) {
 *     this.name = name;
 * }
 *
 * defineLazyValue(MyObj.prototype, 'id', getId);
 *
 * var obj1 = new MyObj('obj1');
 * var obj2 = new MyObj('obj2');
 *
 * console.log( obj2 ); // -> { name: "obj2" }
 * console.log( obj1 ); // -> { name: "obj1" }
 *
 * // the first `id` read will get id `1`
 * console( obj2.id ); // -> 1
 * console( obj1.id ); // -> 2
 *
 * console.log( obj2 ); // -> { name: "obj2", id: 1 }
 * console.log( obj1 ); // -> { name: "obj1", id: 2 }
 *
 * ```
 *
 * @param {Object} object The object to add the property to.
 * @param {String} prop   The name of the property.
 * @param {Function} fn   A function to get the value the property should be set to.
 * @param {boolean} writable   Whether the field should be writable (false by default).
 */
module.exports = function defineLazyValue(obj, prop, initializer, writable) {
	Object.defineProperty(obj, prop, {
		configurable: true,
		get: function() {
			// make the property writable
			Object.defineProperty(this, prop, {
				value: undefined,
				writable: true
			});

			// get the value from the initializer function
			var value = initializer.call(this, obj, prop);

			// redefine the property to the value property
			// and reset the writable flag
			Object.defineProperty(this, prop, {
				value: value,
				writable: !!writable
			});

			// return the value
			return value;
		},
		set: function(value){
			Object.defineProperty(this, prop, {
				value: value,
				writable: !!writable
			});

			return value;
		}
	});
};
