'use strict';

var globals = require('can-globals/can-globals-instance');

// This module depends on isNode being defined
require('../is-node/is-node');

/**
 * @module {function} can-globals/is-browser-window/is-browser-window is-browser-window
 * @parent can-globals/modules
 * @signature `isBrowserWindow()`
 *
 * Returns `true` if the code is running within a Browser window. Use this function if you need special code paths for when running in a Browser window, a Web Worker, or another environment (such as Node.js).
 *
 * ```js
 * var isBrowserWindow = require("can-globals/is-browser-window/is-browser-window");
 * var GLOBAL = require("can-globals/global/global");
 *
 * if(isBrowserWindow()) {
 *   console.log(GLOBAL() === window); // -> true
 * }
 * ```
 *
 * @return {Boolean} True if the environment is a Browser window.
 */

globals.define('isBrowserWindow', function(){
	var isNode = globals.getKeyValue('isNode');
	return typeof window !== "undefined" &&
		typeof document !== "undefined" &&
		isNode === false;
});

module.exports = globals.makeExport('isBrowserWindow');
