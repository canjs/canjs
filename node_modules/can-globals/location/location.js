'use strict';

require('can-globals/global/global');
var globals = require('can-globals/can-globals-instance');

/**
 * @module {function} can-globals/location/location location
 * @parent can-globals/modules
 * 
 * Get the global [`location`](https://developer.mozilla.org/en-US/docs/Web/API/Window/location) object for the current context.
 * 
 * @signature `LOCATION([newLocation])`
 * 
 * Optionally sets, and returns, the [`location`](https://developer.mozilla.org/en-US/docs/Web/API/Window/location) object for the context.
 * 
 * ```js
 * var locationShim = { path: '/' };
 * var LOCATION = require('can-globals/location/location');
 * LOCATION(locationShim);
 * LOCATION().path; // -> '/'
 * ```
 *
 * @param {Object} location An optional location-like object to set as the context's location
 *
 * @return {Object} The location object for this JavaScript environment.
 */
globals.define('location', function(){
	return globals.getKeyValue('global').location;
});

module.exports = globals.makeExport('location');
