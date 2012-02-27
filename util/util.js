can = {};
if (window.STEALDOJO){
	steal('can/util/dojo')
} else if( window.STEALMOO) {
	steal('can/util/mootools')
} else if(window.STEALYUI){
	steal('can/util/yui');
} else if(window.STEALZEPTO){
	steal('can/util/zepto');
} else {
	steal('can/util/jquery')
}



/**
 * @function can.trim
 * @parent can.util
 * Removes leading and trailing whitespace
 * 
 *     Can.trim( " foo " ) // -> "foo"
 * 
 * @param {String} str the string to trim
 * @return {String} the value of the string
 */
//
/**
 * @function can.makeArray
 * @parent can.util
 * Converts array like data into arrays.
 * 
 *     Can.makeArray({0 : "zero", 1: "one", length: 2})
 *        // -> ["zero","one"]
 */

