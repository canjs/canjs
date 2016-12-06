/*!
 * CanJS - 2.1.0-pre
 * http://canjs.us/
 * Copyright (c) 2014 Bitovi
 * Fri, 02 May 2014 01:43:28 GMT
 * Licensed MIT
 * Includes: CanJS default build
 * Download from: http://canjs.us/
 */
define(["can/util/library", "can/view"], function(can){


	var attr = can.view.attr = function (attributeName, attrHandler) {
		if(attrHandler) {
			if (typeof attributeName === "string") {
				attributes[attributeName] = attrHandler;
			} else {
				regExpAttributes.push({
					match: attributeName,
					handler: attrHandler
				});
			}
		} else {
			var cb = attributes[attributeName];
			if( !cb ) {
				
				for( var i = 0, len = regExpAttributes.length; i < len; i++) {
					var attrMatcher = regExpAttributes[i];
					if(attrMatcher.match.test(attributeName)) {
						cb = attrMatcher.handler;
						break;
					}
				}
			}
			return cb;
		}
	};

	var attributes = {},
		regExpAttributes = [],
		automaticCustomElementCharacters = /[-\:]/;

	var tag = can.view.tag = function (tagName, tagHandler) {
		if(tagHandler) {
			// if we have html5shive ... re-generate
			if (window.html5) {
				window.html5.elements += " " + tagName;
				window.html5.shivDocument();
			}
	
			tags[tagName.toLowerCase()] = tagHandler;
		} else {
			var cb = tags[tagName.toLowerCase()];
			if(!cb && automaticCustomElementCharacters.test(tagName)) {
				// empty callback for things that look like special tags
				cb = function(){};
			}
			return cb;
		}
		
	};
	var tags = {};
	
	can.view.callbacks = {
		_tags: tags,
		_attributes: attributes,
		_regExpAttributes: regExpAttributes,
		tag: tag,
		attr: attr,
		// handles calling back a tag callback
		tagHandler: function(el, tagName, tagData){
			var helperTagCallback = tagData.options.read('tags.' + tagName, {
					isArgument: true,
					proxyMethods: false
				})
					.value,
				tagCallback = helperTagCallback || tags[tagName];
	
			// If this was an element like <foo-bar> that doesn't have a component, just render its content
			var scope = tagData.scope,
				res = tagCallback ? tagCallback(el, tagData) : scope;
	
		
	
			// If the tagCallback gave us something to render with, and there is content within that element
			// render it!
			if (res && tagData.subtemplate) {
	
				if (scope !== res) {
					scope = scope.add(res);
				}
				var result = tagData.subtemplate(scope, tagData.options);
				var frag = typeof result === "string" ? can.view.frag(result) : result;
				can.appendChild(el, frag);
			}
		}
	};
	return can.view.callbacks;
});