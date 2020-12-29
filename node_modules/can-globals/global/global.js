'use strict';

/* global self */
/* global WorkerGlobalScope */

var globals = require('can-globals/can-globals-instance');

/**
 * @module {function} can-globals/global/global global
 * @parent can-globals/modules
 * 
 * Get the global object for the current context.
 * 
 * @signature `GLOBAL([newGlobal])`
 *
 * Optionally sets, and returns the global that this environment provides. It will be one of:
 * 
 * ```js
 * var GLOBAL = require('can-globals/global/global');
 * var g = GLOBAL();
 * // In a browser
 * console.log(g === window); // -> true
 * ```
 *
 * - **Browser**: [`window`](https://developer.mozilla.org/en-US/docs/Web/API/window)
 * - **Web Worker**: [`self`](https://developer.mozilla.org/en-US/docs/Web/API/Window/self)
 * - **Node.js**: [`global`](https://nodejs.org/api/globals.html#globals_global)
 * 
 * @param {Object} [newGlobal] An optional global-like object to set as the context's global 
 *
 * @return {Object} The global object for this JavaScript environment.
 */
globals.define('global', function(){
	// Web Worker
	return (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) ? self :

		// Node.js
		typeof process === 'object' &&
		{}.toString.call(process) === '[object process]' ? global :

		// Browser window
		window;
});

module.exports = globals.makeExport('global');
