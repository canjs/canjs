/**
 * @module {function} multi/util/add
 * @parent multi.modules
 * 
 * Adds two numbers together.
 * 
 * @signature `add(first, second)`
 * 
 * @param {Number} first The first number.
 * 
 * @param {Number} second The second number to add.
 * 
 * @return {Number} The two numbers added together.
 * 
 * @body
 * 
 * ## Use
 * 
 * Here I describe how to use it.
 * 
 *     var add = require('multi-module/util/add');
 *     add(1,2) //-> 3
 */

module.exports = function(first, second){
	return first+second;
};
