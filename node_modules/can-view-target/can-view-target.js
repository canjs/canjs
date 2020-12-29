"use strict";
/* jshint maxdepth:7 */
/* jshint latedef:false */
var getDocument = require('can-globals/document/document');
var domMutate = require('can-dom-mutate/node');
var namespace = require('can-namespace');
var MUTATION_OBSERVER = require('can-globals/mutation-observer/mutation-observer');

// if an object or a function
// convert into what it should look like
// then the modification can happen in place
// but it has to have more than the current node
// blah!
var processNodes = function(nodes, paths, location, document){
	var frag = document.createDocumentFragment();

	for(var i = 0, len = nodes.length; i < len; i++) {
		var node = nodes[i];
		frag.appendChild( processNode(node,paths,location.concat(i), document) );
	}
	return frag;
},
	keepsTextNodes =  typeof document !== "undefined" && (function(){
		var testFrag = document.createDocumentFragment();
		var div = document.createElement("div");

		div.appendChild(document.createTextNode(""));
		div.appendChild(document.createTextNode(""));
		testFrag.appendChild(div);

		var cloned  = testFrag.cloneNode(true);

		return cloned.firstChild.childNodes.length === 2;
	})(),
	clonesWork = typeof document !== "undefined" && (function(){
		// Since html5shiv is required to support custom elements, assume cloning
		// works in any browser that doesn't have html5shiv

		// Clone an element containing a custom tag to see if the innerHTML is what we
		// expect it to be, or if not it probably was created outside of the document's
		// namespace.
		var el = document.createElement('a');
		el.innerHTML = "<xyz></xyz>";
		var clone = el.cloneNode(true);
		var works = clone.innerHTML === "<xyz></xyz>";
		var MO, observer;

		if(works) {
			// Cloning text nodes with dashes seems to create multiple nodes in IE11 when
			// MutationObservers of subtree modifications are used on the documentElement.
			// Since this is not what we expect we have to include detecting it here as well.
			el = document.createDocumentFragment();
			el.appendChild(document.createTextNode('foo-bar'));

			MO = MUTATION_OBSERVER();

			if (MO) {
				observer = new MO(function() {});
				observer.observe(document.documentElement, { childList: true, subtree: true });

				clone = el.cloneNode(true);

				observer.disconnect();
			} else {
				clone = el.cloneNode(true);
			}

			return clone.childNodes.length === 1;
		}

		return works;
	})(),
	namespacesWork = typeof document !== "undefined" && !!document.createElementNS;

/**
 * @function cloneNode
 * @hide
 *
 * A custom cloneNode function to be used in browsers that properly support cloning
 * of custom tags (IE8 for example). Fixes it by doing some manual cloning that
 * uses innerHTML instead, which has been shimmed.
 *
 * @param {DocumentFragment} frag A document fragment to clone
 * @return {DocumentFragment} a new fragment that is a clone of the provided argument
 */
var cloneNode = clonesWork ?
	function(el){
		return el.cloneNode(true);
	} :
	function(node){
		var document = node.ownerDocument;
		var copy;

		if(node.nodeType === 1) {
			if(node.namespaceURI !== 'http://www.w3.org/1999/xhtml' && namespacesWork && document.createElementNS) {
				copy = document.createElementNS(node.namespaceURI, node.nodeName);
			}
			else {
				copy = document.createElement(node.nodeName);
			}
		} else if(node.nodeType === 3){
			copy = document.createTextNode(node.nodeValue);
		} else if(node.nodeType === 8) {
			copy = document.createComment(node.nodeValue);
		} else if(node.nodeType === 11) {
			copy = document.createDocumentFragment();
		}

		if(node.attributes) {
			var attributes = node.attributes;
			for (var i = 0; i < attributes.length; i++) {
				var attribute = attributes[i];
				if (attribute && attribute.specified) {
					// If the attribute has a namespace set the namespace 
					// otherwise it will be set to null
					if (attribute.namespaceURI) {
						copy.setAttributeNS(attribute.namespaceURI, attribute.nodeName || attribute.name, attribute.nodeValue || attribute.value);
					} else {
						copy.setAttribute(attribute.nodeName || attribute.name, attribute.nodeValue || attribute.value);
					}
				}
			}
		}

		if(node && node.firstChild) {
			var child = node.firstChild;

			while(child) {
				copy.appendChild( cloneNode(child) );
				child = child.nextSibling;
			}
		}

		return copy;
	};

function processNode(node, paths, location, document){
	var callback,
		loc = location,
		nodeType = typeof node,
		el,
		p,
		i , len;
	var getCallback = function(){
		if(!callback) {
			callback  = {
				path: location,
				callbacks: []
			};
			paths.push(callback);
			loc = [];
		}
		return callback;
	};

	if(nodeType === "object") {
		if( node.tag ) {
			if(namespacesWork && node.namespace) {
				el = document.createElementNS(node.namespace, node.tag);
			} else {
				el = document.createElement(node.tag);
			}

			if(node.attrs) {
				for(var attrName in node.attrs) {
					var value = node.attrs[attrName];
					if(typeof value === "function"){
						getCallback().callbacks.push({
							callback:  value
						});
					} else if (value !== null && typeof value === "object" && value.namespaceURI) {
						el.setAttributeNS(value.namespaceURI,attrName,value.value);
					} else {
						domMutate.setAttribute.call(el, attrName, value);
					}
				}
			}
			if(node.attributes) {
				for(i = 0, len = node.attributes.length; i < len; i++ ) {
					getCallback().callbacks.push({callback: node.attributes[i]});
				}
			}
			if(node.children && node.children.length) {
				// add paths
				if(callback) {
					p = callback.paths = [];
				} else {
					p = paths;
				}

				el.appendChild( processNodes(node.children, p, loc, document) );
			}
		} else if(node.comment) {
			el = document.createComment(node.comment);

			if(node.callbacks) {
				for(i = 0, len = node.callbacks.length; i < len; i++ ) {
					getCallback().callbacks.push({callback: node.callbacks[i]});
				}
			}
		}


	} else if(nodeType === "string"){

		el = document.createTextNode(node);

	} else if(nodeType === "function") {

		if(keepsTextNodes) {
			el = document.createTextNode("");
			getCallback().callbacks.push({
				callback: node
			});
		} else {
			el = document.createComment("~");
			getCallback().callbacks.push({
				callback: function(){
					var el = document.createTextNode("");
					domMutate.replaceChild.call(this.parentNode, el, this);
					return node.apply(el,arguments );
				}
			});
		}

	}
	return el;
}

function getCallbacks(el, pathData, elementCallbacks){
	var path = pathData.path,
		callbacks = pathData.callbacks,
		paths = pathData.paths,
		child = el,
		pathLength = path ? path.length : 0,
		pathsLength = paths ? paths.length : 0;

	for(var i = 0; i < pathLength; i++) {
		child = child.childNodes.item(path[i]);
	}

	for( i= 0 ; i < pathsLength; i++) {
		getCallbacks(child, paths[i], elementCallbacks);
	}

	elementCallbacks.push({element: child, callbacks: callbacks});
}

function hydrateCallbacks(callbacks, args) {
	var len = callbacks.length,
		callbacksLength,
		callbackElement,
		callbackData;

	for(var i = 0; i < len; i++) {
		callbackData = callbacks[i];
		callbacksLength = callbackData.callbacks.length;
		callbackElement = callbackData.element;
		for(var c = 0; c < callbacksLength; c++) {
			callbackData.callbacks[c].callback.apply(callbackElement, args);
		}
	}
}

function makeTarget(nodes, doc){
	var paths = [];
	var frag = processNodes(nodes, paths, [], doc || getDocument());
	return {
		paths: paths,
		clone: frag,
		hydrate: function(){
			var cloned = cloneNode(this.clone);
			var args = [];
			for (var a = 0, ref = args.length = arguments.length; a < ref; a++) {
				args[a] = arguments[a];
			} // see https://jsperf.com/nodelist-to-array

			var callbacks = [];
			for(var i = 0; i < paths.length; i++) {
				getCallbacks(cloned, paths[i], callbacks);
			}
			hydrateCallbacks(callbacks, args);

			return cloned;
		}
	};
}
makeTarget.keepsTextNodes = keepsTextNodes;
makeTarget.cloneNode = cloneNode;

namespace.view = namespace.view || {};
module.exports = namespace.view.target = makeTarget;
