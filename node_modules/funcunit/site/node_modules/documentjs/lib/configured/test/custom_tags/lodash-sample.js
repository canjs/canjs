/**
 * @module {{}} _
 * Foo
 */
// 
/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The object to inspect.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * _.keys({ 'one': 1, 'two': 2, 'three': 3 });
 * // → ['one', 'two', 'three'] (property order is not guaranteed across environments)
 */
var keys = !nativeKeys ? shimKeys : function(object) {
  if (object) {
    var Ctor = object.constructor,
        length = object.length;
  }
  if ((typeof Ctor == 'function' && Ctor.prototype === object) ||
      (typeof length == 'number' && length > 0) ||
      (lodash.support.enumPrototypes && typeof object == 'function')) {
    return shimKeys(object);
  }
  return isObject(object) ? nativeKeys(object) : [];
};