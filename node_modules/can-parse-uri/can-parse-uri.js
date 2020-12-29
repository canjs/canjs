"use strict";
/**
 * @module {function} can-parse-uri can-parse-uri
 * @parent can-js-utilities
 * @collection can-infrastructure
 * @package ./package.json
 * @signature `parseURI(url)`
 *
 * Parse a URI into its components.
 *
 * ```js
 * import {parseURI} from "can"
 * parseURI("http://foo:8080/bar.html?query#change")
 * //-> {
 * //  authority: "//foo:8080",
 * //  hash: "#change",
 * //  host: "foo:8080",
 * //  hostname: "foo",
 * //  href: "http://foo:8080/bar.html?query#change",
 * //  pathname: "/bar.html",
 * //  port: "8080",
 * //  protocol: "http:",
 * //  search: "?query"
 * // }
 * ```
 *
 * @param {String} url The URL you want to parse.
 *
 * @return {Object} Returns an object with properties for each part of the URL. `null`
 * is returned if the url can not be parsed.
 */
var namespace = require("can-namespace");
module.exports = namespace.parseURI = function(url){
		var m = String(url).replace(/^\s+|\s+$/g, '').match(/^([^:\/?#]+:)?(\/\/(?:[^:@]*(?::[^:@]*)?@)?(([^:\/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/);
			// authority = '//' + user + ':' + pass '@' + hostname + ':' port
		return (m ? {
			href     : m[0] || '',
			protocol : m[1] || '',
			authority: m[2] || '',
			host     : m[3] || '',
			hostname : m[4] || '',
			port     : m[5] || '',
			pathname : m[6] || '',
			search   : m[7] || '',
			hash     : m[8] || ''
		} : null);
	};
