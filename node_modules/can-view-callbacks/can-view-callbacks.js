"use strict";
var ObservationRecorder = require('can-observation-recorder');

var dev = require('can-log/dev/dev');
var getGlobal = require('can-globals/global/global');
var getDocument = require('can-globals/document/document');
var domMutate = require('can-dom-mutate');
var domMutateNode = require('can-dom-mutate/node');
var namespace = require('can-namespace');
var makeFrag = require("can-fragment");
var globals = require('can-globals');
var canSymbol = require('can-symbol');
var canReflect = require('can-reflect');

var callbackMapSymbol = canSymbol.for('can.callbackMap');
var initializeSymbol = canSymbol.for('can.initialize');

//!steal-remove-start
if (process.env.NODE_ENV !== 'production') {
	var requestedAttributes = {};
}
//!steal-remove-end

var tags = {};

// WeakSet containing elements that have been rendered already
// and therefore do not need to be rendered again

var automountEnabled = function(){
	var document = globals.getKeyValue("document");
	if(document == null || document.documentElement == null) {
		return false;
	}
	return document.documentElement.getAttribute("data-can-automount") !== "false";
};

var renderedElements = new WeakMap();

var mountElement = function (node) {
	var tagName = node.tagName && node.tagName.toLowerCase();
	var tagHandler = tags[tagName];

	// skip elements that already have a viewmodel or elements whose tags don't match a registered tag
	// or elements that have already been rendered
	if (tagHandler) {
		callbacks.tagHandler(node, tagName, {});
	}
};

var mutationObserverEnabled = false;
var disableMutationObserver;
var enableMutationObserver = function() {
	var docEl = getDocument().documentElement;

	if (mutationObserverEnabled) {
		if (mutationObserverEnabled === docEl) {
			return;
		}
		// if the document has changed, re-enable mutationObserver
		disableMutationObserver();
	}

	var undoOnInsertionHandler = domMutate.onConnected(docEl, function(mutation) {
		mountElement(mutation.target);
	});
	mutationObserverEnabled = true;

	disableMutationObserver = function() {
		undoOnInsertionHandler();
		mutationObserverEnabled = false;
	};
};

var renderTagsInDocument = function(tagName) {
	var nodes = getDocument().getElementsByTagName(tagName);

	for (var i=0, node; (node = nodes[i]) !== undefined; i++) {
		mountElement(node);
	}
};

var attr = function (attributeName, attrHandler) {
	if(attrHandler) {
		if (typeof attributeName === "string") {
			attributes[attributeName] = attrHandler;
			//!steal-remove-start
			if (process.env.NODE_ENV !== 'production') {
				if(requestedAttributes[attributeName]) {
					dev.warn("can-view-callbacks: " + attributeName+ " custom attribute behavior requested before it was defined.  Make sure "+attributeName+" is defined before it is needed.");
				}
			}
			//!steal-remove-end
		} else {
			regExpAttributes.push({
				match: attributeName,
				handler: attrHandler
			});

			//!steal-remove-start
			if (process.env.NODE_ENV !== 'production') {
				Object.keys(requestedAttributes).forEach(function(requested){
					if(attributeName.test(requested)) {
						dev.warn("can-view-callbacks: " + requested+ " custom attribute behavior requested before it was defined.  Make sure "+requested+" is defined before it is needed.");
					}
				});
			}
			//!steal-remove-end
		}
	} else {
		var cb = attributes[attributeName];
		if( !cb ) {

			for( var i = 0, len = regExpAttributes.length; i < len; i++) {
				var attrMatcher = regExpAttributes[i];
				if(attrMatcher.match.test(attributeName)) {
					return attrMatcher.handler;
				}
			}
		}
		//!steal-remove-start
		if (process.env.NODE_ENV !== 'production') {
			requestedAttributes[attributeName] = true;
		}
		//!steal-remove-end

		return cb;
	}
};

var attrs = function(attrMap) {
	var map = canReflect.getKeyValue(attrMap, callbackMapSymbol) || attrMap;

	// Only add bindings once.
	if(attrMaps.has(map)) {
		return;
	} else {
		// Would prefer to use WeakSet but IE11 doesn't support it.
		attrMaps.set(map, true);
	}

	canReflect.eachKey(map, function(callback, exp){
		attr(exp, callback);
	});
};

var attributes = {},
	regExpAttributes = [],
	attrMaps = new WeakMap(),
	automaticCustomElementCharacters = /[-\:]/;
var defaultCallback = function () {};

var tag = function (tagName, tagHandler) {
	if(tagHandler) {
		var validCustomElementName = automaticCustomElementCharacters.test(tagName),
			tagExists = typeof tags[tagName.toLowerCase()] !== 'undefined',
			customElementExists;

		//!steal-remove-start
		if (process.env.NODE_ENV !== 'production') {
			if (tagExists) {
				dev.warn("Custom tag: " + tagName.toLowerCase() + " is already defined");
			}

			if (!validCustomElementName && tagName !== "content") {
				dev.warn("Custom tag: " + tagName.toLowerCase() + " hyphen missed");
			}
		}
		//!steal-remove-end

		tags[tagName.toLowerCase()] = tagHandler;

		if(automountEnabled()) {
			var customElements = globals.getKeyValue("customElements");

			// automatically render elements that have tagHandlers
			// If browser supports customElements, register the tag as a custom element
			if (customElements) {
				customElementExists = customElements.get(tagName.toLowerCase());

				if (validCustomElementName && !customElementExists) {
					var CustomElement = function() {
						return Reflect.construct(HTMLElement, [], CustomElement);
					};

					CustomElement.prototype = Object.create(HTMLElement.prototype);
					CustomElement.prototype.constructor = CustomElement;

					CustomElement.prototype.connectedCallback = function() {
						callbacks.tagHandler(this, tagName.toLowerCase(), {});
					};

					customElements.define(tagName, CustomElement);
				}
			}
			// If browser doesn't support customElements, set up MutationObserver for
			// rendering elements when they are inserted in the page
			// and rendering elements that are already in the page
			else {
				enableMutationObserver();
				renderTagsInDocument(tagName);
			}
		} else if(mutationObserverEnabled) {
			disableMutationObserver();
		}
	} else {
		var cb;

		// if null is passed as tagHandler, remove tag
		if (tagHandler === null) {
			delete tags[tagName.toLowerCase()];
		} else {
			cb = tags[tagName.toLowerCase()];
		}

		if(!cb && automaticCustomElementCharacters.test(tagName)) {
			// empty callback for things that look like special tags
			cb = defaultCallback;
		}
		return cb;
	}

};

var callbacks = {
	_tags: tags,
	_attributes: attributes,
	_regExpAttributes: regExpAttributes,
	defaultCallback: defaultCallback,
	tag: tag,
	attr: attr,
	attrs: attrs,
	// handles calling back a tag callback
	tagHandler: function(el, tagName, tagData){
		// skip elements that have already been rendered
		if (renderedElements.has(el)) {
			return;
		}

		var scope = tagData.scope,
			helperTagCallback = scope && scope.templateContext.tags.get(tagName),
			tagCallback = helperTagCallback || tags[tagName] || el[initializeSymbol],
			res;

		// If this was an element like <foo-bar> that doesn't have a component, just render its content
		if(tagCallback) {
			res = ObservationRecorder.ignore(tagCallback)(el, tagData);

			// add the element to the Set of elements that have had their handlers called
			// this will prevent the handler from being called again when the element is inserted
			renderedElements.set(el, true);
		} else {
			res = scope;
		}

		//!steal-remove-start
		if (process.env.NODE_ENV !== 'production') {
			if (!tagCallback) {
				var GLOBAL = getGlobal();
				var ceConstructor = getDocument().createElement(tagName).constructor;
				// If not registered as a custom element, the browser will use default constructors
				if (ceConstructor === GLOBAL.HTMLElement || ceConstructor === GLOBAL.HTMLUnknownElement) {
					dev.warn('can-view-callbacks: No custom element found for ' + tagName);
				}
			}
		}
		//!steal-remove-end

		// If the tagCallback gave us something to render with, and there is content within that element
		// render it!
		if (res && tagData.subtemplate) {
			if (scope !== res) {
				scope = scope.add(res);
			}

			//var nodeList = nodeLists.register([], undefined, tagData.parentNodeList || true, false);
			//nodeList.expression = "<" + el.tagName + ">";

			var result = tagData.subtemplate(scope, tagData.options);
			var frag = typeof result === "string" ? makeFrag(result) : result;
			domMutateNode.appendChild.call(el, frag);
		}
	}
};

namespace.view = namespace.view || {};

if (namespace.view.callbacks) {
	throw new Error("You can't have two versions of can-view-callbacks, check your dependencies");
} else {
	module.exports = namespace.view.callbacks = callbacks;
}
