'use strict';
// ##string.js
// _Miscellaneous string utility functions._
// Several of the methods in this plugin use code adapted from Prototype
// Prototype JavaScript framework, version 1.6.0.1.
// © 2005-2007 Sam Stephenson
var strUndHash = /_|-/,
	strColons = /\=\=/,
	strWords = /([A-Z]+)([A-Z][a-z])/g,
	strLowUp = /([a-z\d])([A-Z])/g,
	strDash = /([a-z\d])([A-Z])/g,
	strQuote = /"/g,
	strSingleQuote = /'/g,
	strHyphenMatch = /-+(.)?/g,
	strCamelMatch = /[a-z][A-Z]/g,
	convertBadValues = function (content) {
		// Convert bad values into empty strings
		var isInvalid = content === null || content === undefined || isNaN(content) && '' + content === 'NaN';
		return '' + (isInvalid ? '' : content);
	};

var string = {
	/**
	 * @function can-string.esc esc
	 * @signature `string.esc(content)`
	 * @param  {String} content a string
	 * @return {String}         the string safely HTML-escaped
	 *
	 * ```js
	 * var string = require("can-string");
	 *
	 * string.esc("<div>&nbsp;</div>"); //-> "&lt;div&gt;&amp;nbsp;&lt;/div&gt;"
	 * ```
	 */
	esc: function (content) {
		return convertBadValues(content)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(strQuote, '&#34;')
			.replace(strSingleQuote, '&#39;');
	},
	/**
	 * @function can-string.capitalize capitalize
	 * @signature `string.capitalize(s)`
	 * @param  {String} s     the string to capitalize
	 * @return {String}       the supplied string with the first character uppercased if it is a letter
	 *
	 * ```js
	 * var string = require("can-string");
	 *
	 * console.log(string.capitalize("foo")); // -> "Foo"
	 * console.log(string.capitalize("123")); // -> "123"
	 * ```
	 */
	capitalize: function (s) {
		// Used to make newId.
		return s.charAt(0)
			.toUpperCase() + s.slice(1);
	},
	/**
	 * @function can-string.camelize camelize
	 * @signature `string.camelize(s)`
	 * @param  {String} str   the string to camelCase
	 * @return {String}       the supplied string with hyphens removed and following letters capitalized.
	 *
	 * ```js
	 * var string = require("can-string");
	 *
	 * console.log(string.camelize("foo-bar")); // -> "fooBar"
	 * console.log(string.camelize("-webkit-flex-flow")); // -> "WebkitFlexFlow"
	 * ```
	 */
	camelize: function (str) {
		return convertBadValues(str)
			.replace(strHyphenMatch, function (match, chr) {
				return chr ? chr.toUpperCase() : '';
			});
	},
	/**
	 * @function can-string.hyphenate hyphenate
	 * @signature `string.hyphenate(s)`
	 * @param  {String} str   a string in camelCase
	 * @return {String}       the supplied string with camelCase converted to hyphen-lowercase digraphs
	 *
	 * ```js
	 * var string = require("can-string");
	 *
	 * console.log(string.hyphenate("fooBar")); // -> "foo-bar"
	 * console.log(string.hyphenate("WebkitFlexFlow")); // -> "Webkit-flex-flow"
	 * ```
	 */
	hyphenate: function (str) {
		return convertBadValues(str)
			.replace(strCamelMatch, function (str) {
				return str.charAt(0) + '-' + str.charAt(1)
					.toLowerCase();
			});
	},
	/**
	 * @function can-string.pascalize pascalize
	 * @signature `string.pascalize(s)`
	 * @param  {String} str   the string in hyphen case | camelCase
	 * @return {String}       the supplied string with hyphens | camelCase converted to PascalCase
	 *
	 * ```js
	 * var string = require("can-string");
	 *
	 * console.log(string.pascalize("fooBar")); // -> "FooBar"
	 * console.log(string.pascalize("baz-bar")); // -> "BazBar"
	 * ```
	 */
	pascalize: function (str) {
		return string.capitalize(string.camelize(str));
	},
	/**
	 * @function can-string.underscore underscore
	 * @signature `string.underscore(s)`
	 * @param  {String} str   a string in camelCase
	 * @return {String}       the supplied string with camelCase converted to underscore-lowercase digraphs
	 *
	 * ```js
	 * var string = require("can-string");
	 *
	 * console.log(string.underscore("fooBar")); // -> "foo_bar"
	 * console.log(string.underscore("HTMLElement")); // -> "html_element"
	 * ```
	 */
	underscore: function (s) {
		return s.replace(strColons, '/')
			.replace(strWords, '$1_$2')
			.replace(strLowUp, '$1_$2')
			.replace(strDash, '_')
			.toLowerCase();
	},
	/**
	 * @property {RegExp} can-string.strUndHash strUndHash
	 *
	 * A regex which matches an underscore or hyphen character
	 */
	undHash: strUndHash
};
module.exports = string;
