/**
 * Get a value from an object using dotted key notation.

 * @param {String} key
 * @param {Object} object
 * @return Value
 */
 exports.getKey = function(object, key) {
   var i;
   key = key.split('.');
   for (i=0; i<key.length; i++) {
     object = object[key[i]];
     if (typeof object === 'undefined') return;
   }
   return object;
 };


/**
 * Evaluates if an input is an object.
 *
 * @param input
 * @return {bool} Is input an object?
 */
exports.isObject = function(input) {
  return (null !== input) && ('object' === typeof input) && (!Array.isArray(input));
};
