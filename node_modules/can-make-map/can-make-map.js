"use strict";
/**
 * @module {function} can-make-map can-make-map
 * @parent can-js-utilities
 * @collection can-infrastructure
 * @package ./package.json
 * @description Convert a comma-separated string into a plain JavaScript object.
 * @signature `makeMap( string )`
 * @param  {String} string A comma separated list of values
 * @return {Object} A JavaScript object with the same keys as the passed-in comma-separated values
 *
 * makeMap takes a comma-separated string (can-list, NodeList, etc.) and converts it to a JavaScript object
 */
function makeMap(str) {
	var obj = {}, items = str.split(",");
	items.forEach(function(name){
		obj[name] = true;
	});
	return obj;
}

module.exports = makeMap;
