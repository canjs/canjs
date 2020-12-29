'use strict';

var globals = require('can-globals');
var namespace = require('can-namespace');
var domMutate = require('../can-dom-mutate');
var util = require('../-util');

var getParents = util.getParents;
var contains = util.contains;
var isConnected = require("../-is-connected");


var compat = {
	replaceChild: function (newChild, oldChild) {
		var newChildren = getParents(newChild);
		var result = this.replaceChild(newChild, oldChild);
		domMutate.dispatchNodeRemoval(oldChild, this);
		for (var i = 0; i < newChildren.length; i++) {
			domMutate.dispatchNodeInsertion(newChildren[i], this);
		}
		return result;
	},
	setAttribute: function (name, value) {
		var oldAttributeValue = this.getAttribute(name);
		var result = this.setAttribute(name, value);
		var newAttributeValue = this.getAttribute(name);
		if (oldAttributeValue !== newAttributeValue) {
			domMutate.dispatchNodeAttributeChange(this, name, oldAttributeValue);
		}
		return result;
	},
	setAttributeNS: function (namespace, name, value) {
		var oldAttributeValue = this.getAttribute(name);
		var result = this.setAttributeNS(namespace, name, value);
		var newAttributeValue = this.getAttribute(name);
		if (oldAttributeValue !== newAttributeValue) {
			domMutate.dispatchNodeAttributeChange(this, name, oldAttributeValue);
		}
		return result;
	},
	removeAttribute: function (name) {
		var oldAttributeValue = this.getAttribute(name);
		var result = this.removeAttribute(name);
		if (oldAttributeValue) {
			domMutate.dispatchNodeAttributeChange(this, name, oldAttributeValue);
		}
		return result;
	}
};

var compatData = [
	['appendChild', 'Insertion'],
	['insertBefore', 'Insertion'],
	['removeChild', 'Removal']
];
compatData.forEach(function (pair) {
	var nodeMethod = pair[0];
	var dispatchMethod = 'dispatchNode' + pair[1];
	compat[nodeMethod] = function (node) {
		var nodes = getParents(node);
		var result = this[nodeMethod].apply(this, arguments);
		for (var i = 0; i < nodes.length; i++) {
			domMutate[dispatchMethod](nodes[i], this);
		}
		return result;
	};
});

var normal = {};
var nodeMethods = ['appendChild', 'insertBefore', 'removeChild', 'replaceChild', 'setAttribute', 'setAttributeNS', 'removeAttribute'];
nodeMethods.forEach(function (methodName) {
	normal[methodName] = function () {
		if(isConnected.isConnected(this)) {
			return this[methodName].apply(this, arguments);
		} else {
			return compat[methodName].apply(this, arguments);
		}
	};
});

/**
* @module {{}} can-dom-mutate/node node
* @parent can-dom-mutate/modules
*
* Append, insert, and remove DOM nodes. Also, change node attributes.
* This allows mutations to be dispatched in environments where MutationObserver is not supported.
* @signature `mutateNode`
*
* Exports an `Object` with methods that shouhld be used to mutate HTML.
*
* ```js
* var mutateNode = require('can-dom-mutate/node');
* var el = document.createElement('div');
*
* mutateNode.appendChild.call(document.body, el);
*
* ```
*/
var mutate = {};

/**
* @function can-dom-mutate/node.appendChild appendChild
* @parent can-dom-mutate/node
*
* Append a node to an element, effectively `Node.prototype.appendChild`.
*
* @signature `mutate.appendChild.call(parent, child)`
*
* @param {Node} parent The parent into which the child is inserted.
* @param {Node} child The child which will be inserted into the parent.
* @return {Node} The appended child.
*/

/**
* @function can-dom-mutate/node.insertBefore insertBefore
* @parent can-dom-mutate/node
*
* Insert a node before a given reference node in an element, effectively `Node.prototype.insertBefore`.
*
* @signature `mutate.insertBefore.call(parent, child, reference)`
* @param {Node} parent The parent into which the child is inserted.
* @param {Node} child The child which will be inserted into the parent.
* @param {Node} reference The reference which the child will be placed before.
* @return {Node} The inserted child.
*/

/**
* @function can-dom-mutate/node.removeChild removeChild
* @parent can-dom-mutate/node
*
* Remove a node from an element, effectively `Node.prototype.removeChild`.
*
* @signature `mutate.removeChild.call(parent, child)`
*
* @param {Node} parent The parent from which the child is removed.
* @param {Node} child The child which will be removed from the parent.
* @return {Node} The removed child.
*/

/**
* @function can-dom-mutate/node.replaceChild replaceChild
* @parent can-dom-mutate/node
*
* Insert a node before a given reference node in an element, effectively `Node.prototype.replaceChild`.
*
* @signature `mutate.replaceChild.call(parent, newChild, oldChild)`
*
* @param {Node} parent The parent into which the newChild is inserted.
* @param {Node} newChild The child which is inserted into the parent.
* @param {Node} oldChild The child which is removed from the parent.
* @return {Node} The replaced child.
*/

/**
* @function can-dom-mutate/node.setAttribute setAttribute
* @parent can-dom-mutate/node
*
* Set an attribute value on an element, effectively `Element.prototype.setAttribute`.
*
* @signature `mutate.setAttribute.call(element, name, value)`
*
* @param {Element} element The element on which to set the attribute.
* @param {String} name The name of the attribute to set.
* @param {String} value The value to set on the attribute.
*/

/**
* @function can-dom-mutate/node.removeAttribute removeAttribute
* @parent can-dom-mutate/node
*
* Removes an attribute from an element, effectively `Element.prototype.removeAttribute`.
*
* @signature `mutate.removeAttribute.call(element, name, value)`
*
* @param {Element} element The element from which to remove the attribute.
* @param {String} name The name of the attribute to remove.
*/

function setMutateStrategy(observer) {
	var strategy = observer ? normal : compat;

	for (var key in strategy) {
		mutate[key] = strategy[key];
	}
}

var mutationObserverKey = 'MutationObserver';
setMutateStrategy(globals.getKeyValue(mutationObserverKey));
globals.onKeyValue(mutationObserverKey, setMutateStrategy);

module.exports = namespace.domMutateNode = domMutate.node = mutate;
