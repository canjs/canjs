'use strict';


var globals = require('../can-globals-instance');
require('../global/global');
require('../document/document');

/**
 * @module {function} can-globals/base-url/base-url base-url
 * @parent can-globals/modules
 *
 * @signature `baseUrl(optionalBaseUrlToSet)`
 *
 * Get and/or set the "base" (containing path) of the document.
 *
 * ```js
 * var baseUrl = require("can-globals/base-url/base-url");
 *
 * console.log(baseUrl());           // -> "http://localhost:8080"
 * console.log(baseUrl(baseUrl() + "/foo/bar")); // -> "http://localhost:8080/foo/bar"
 * console.log(baseUrl());           // -> "http://localhost:8080/foo/bar"
 * ```
 *
 * @param {String} setUrl An optional base url to override reading the base URL from the known path.
 *
 * @return {String} Returns the set or computed base URL
 */

globals.define('base-url', function(){
	var global = globals.getKeyValue('global');
	var domDocument = globals.getKeyValue('document');
	if (domDocument && 'baseURI' in domDocument) {
		return domDocument.baseURI;
	} else if(global.location) {
		var href = global.location.href;
		var lastSlash = href.lastIndexOf("/");
		return lastSlash !== -1 ? href.substr(0, lastSlash) : href;
	} else if(typeof process !== "undefined") {
		return process.cwd();
	}
});

module.exports = globals.makeExport('base-url');
