"use strict";
var namespace = require('can-namespace');
var dev = require('can-log/dev/dev');

/**
 * @module {{}} can-attribute-encoder can-attribute-encoder
 * @parent can-dom-utilities
 * @collection can-infrastructure
 * @package ./package.json
 *
 * Encode and decode attribute names.
 *
 * @option {Object} An object with the methods:
 * [can-attribute-encoder.encode] and [can-attribute-encoder.decode].
 *
 */


function each(items, callback){
	for ( var i = 0; i < items.length; i++ ) {
		callback(items[i], i);
	}
}

function makeMap(str){
	var obj = {}, items = str.split(",");
	each(items, function(name){
		obj[name] = true;
	});
	return obj;
}

// Attributes for which the case matters - shouldn’t be lowercased.
var caseMattersAttributes = makeMap("allowReorder,attributeName,attributeType,autoReverse,baseFrequency,baseProfile,calcMode,clipPathUnits,contentScriptType,contentStyleType,diffuseConstant,edgeMode,externalResourcesRequired,filterRes,filterUnits,glyphRef,gradientTransform,gradientUnits,kernelMatrix,kernelUnitLength,keyPoints,keySplines,keyTimes,lengthAdjust,limitingConeAngle,markerHeight,markerUnits,markerWidth,maskContentUnits,maskUnits,patternContentUnits,patternTransform,patternUnits,pointsAtX,pointsAtY,pointsAtZ,preserveAlpha,preserveAspectRatio,primitiveUnits,repeatCount,repeatDur,requiredExtensions,requiredFeatures,specularConstant,specularExponent,spreadMethod,startOffset,stdDeviation,stitchTiles,surfaceScale,systemLanguage,tableValues,textLength,viewBox,viewTarget,xChannelSelector,yChannelSelector,controlsList");

function camelCaseToSpinalCase(match, lowerCaseChar, upperCaseChar) {
	return lowerCaseChar + "-" + upperCaseChar.toLowerCase();
}

function startsWith(allOfIt, startsWith) {
	return allOfIt.indexOf(startsWith) === 0;
}

function endsWith(allOfIt, endsWith) {
	return (allOfIt.length - allOfIt.lastIndexOf(endsWith)) === endsWith.length;
}

var regexes = {
	leftParens: /\(/g,
	rightParens: /\)/g,
	leftBrace: /\{/g,
	rightBrace: /\}/g,
	camelCase: /([a-z]|[0-9]|^)([A-Z])/g,
	forwardSlash: /\//g,
	space: /\s/g,
	uppercase: /[A-Z]/g,
	uppercaseDelimiterThenChar: /:u:([a-z])/g,
	caret: /\^/g,
	dollar: /\$/g,
	at: /@/g
};

var delimiters = {
	prependUppercase: ':u:',
	replaceSpace: ':s:',
	replaceForwardSlash: ':f:',
	replaceLeftParens: ':lp:',
	replaceRightParens: ':rp:',
	replaceLeftBrace: ':lb:',
	replaceRightBrace: ':rb:',
	replaceCaret: ':c:',
	replaceDollar: ':d:',
	replaceAt: ':at:'
};

var encoder = {};

/**
 * @function can-attribute-encoder.encode encode
 * @parent can-attribute-encoder
 * @description Encode an attribute name
 *
 * @signature `encoder.encode(attributeName)`
 *
 * Note: specific encoding may change, but encoded attributes
 * can always be decoded using [can-attribute-encoder.decode].
 *
 * @body
 *
 * ```js
 * var encodedAttributeName = encoder.encode("{(^$foo/bar baz)}");
 * div.setAttribute(encodedAttributeName, "attribute value");
 * ```
 *
 * @param {String} attributeName The attribute name.
 * @return {String} The encoded attribute name.
 *
 */
encoder.encode = function(name) {
	var encoded = name;

	// encode or convert camelCase attributes unless in list of attributes
	// where case matters
	if (!caseMattersAttributes[encoded] && encoded.match(regexes.camelCase)) {
		// encode uppercase characters in new bindings
		// - on:fooBar, fooBar:to, fooBar:from, fooBar:bind
		if (
			startsWith(encoded, 'on:') ||
			endsWith(encoded, ':to') ||
			endsWith(encoded, ':from') ||
			endsWith(encoded, ':bind') ||
			endsWith(encoded, ':raw')
		) {
			encoded = encoded
				.replace(regexes.uppercase, function(char) {
					return delimiters.prependUppercase + char.toLowerCase();
				});
		} else if(startsWith(encoded, '(') || startsWith(encoded, '{')) {
			// convert uppercase characters in older bindings to kebab-case
			// - {fooBar}, (fooBar), {(fooBar)}
			encoded = encoded.replace(regexes.camelCase, camelCaseToSpinalCase);
			//!steal-remove-start
			if(process.env.NODE_ENV !== 'production') {
				dev.warn("can-attribute-encoder: Found attribute with name: " + name + ". Converting to: " + encoded + '.');
			}
			//!steal-remove-end
		}
	}

	//encode spaces
	encoded = encoded.replace(regexes.space, delimiters.replaceSpace)
		//encode forward slashes
		.replace(regexes.forwardSlash, delimiters.replaceForwardSlash)
		// encode left parentheses
		.replace(regexes.leftParens, delimiters.replaceLeftParens)
		// encode right parentheses
		.replace(regexes.rightParens, delimiters.replaceRightParens)
		// encode left braces
		.replace(regexes.leftBrace, delimiters.replaceLeftBrace)
		// encode left braces
		.replace(regexes.rightBrace, delimiters.replaceRightBrace)
		// encode ^
		.replace(regexes.caret, delimiters.replaceCaret)
		// encode $
		.replace(regexes.dollar, delimiters.replaceDollar)
		// encode @
		.replace(regexes.at, delimiters.replaceAt);

	return encoded;
};

/**
 * @function can-attribute-encoder.decode decode
 * @parent can-attribute-encoder
 * @description Decode an attribute name encoded by [can-attribute-encoder.encode]
 * @signature `encoder.decode(attributeName)`
 *
 * @body
 *
 * ```js
 * encoder.decode(attributeName); // -> "{(^$foo/bar baz)}"
 *
 * ```
 *
 * @param {String} attributeName The encoded attribute name.
 * @return {String} The decoded attribute name.
 *
 */
encoder.decode = function(name) {
	var decoded = name;

	// decode uppercase characters in new bindings
	if (!caseMattersAttributes[decoded] && regexes.uppercaseDelimiterThenChar.test(decoded)) {
		if (
			startsWith(decoded, 'on:') ||
			endsWith(decoded, ':to') ||
			endsWith(decoded, ':from') ||
			endsWith(decoded, ':bind') ||
			endsWith(decoded, ':raw')
		) {
			decoded = decoded
				.replace(regexes.uppercaseDelimiterThenChar, function(match, char) {
					return char.toUpperCase();
				});
		}
	}

	// decode left parentheses
	decoded = decoded.replace(delimiters.replaceLeftParens, '(')
		// decode right parentheses
		.replace(delimiters.replaceRightParens, ')')
		// decode left braces
		.replace(delimiters.replaceLeftBrace, '{')
		// decode left braces
		.replace(delimiters.replaceRightBrace, '}')
		// decode forward slashes
		.replace(delimiters.replaceForwardSlash, '/')
		// decode spaces
		.replace(delimiters.replaceSpace, ' ')
		// decode ^
		.replace(delimiters.replaceCaret, '^')
		//decode $
		.replace(delimiters.replaceDollar, '$')
		//decode @
		.replace(delimiters.replaceAt, '@');

	return decoded;
};

if (namespace.encoder) {
	throw new Error("You can't have two versions of can-attribute-encoder, check your dependencies");
} else {
	module.exports = namespace.encoder = encoder;
}
