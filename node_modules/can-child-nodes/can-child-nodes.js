
'use strict';

var namespace = require("can-namespace");

/**
 * @module {function} can-child-nodes
 * @parent can-dom-utilities
 * @collection can-infrastructure
 * @package ./package.json
 * 
 * @signature `childNodes(node)`
 *
 * Get all of the childNodes of a given node.
 *
 * ```js
 * var stache = require("can-stache");
 * var childNodes = require("can-util/child-nodes/child-nodes");
 *
 * var html = "<div><h1><span></span></h1></div>";
 * var frag = stache(html)();
 *
 * console.log(childNodes(frag)[0].nodeName); // -> DIV
 * ```
 *
 * @param {Object} node The Node that you want child nodes for.
 */

function childNodes(node) {
	var childNodes = node.childNodes;
	if ("length" in childNodes) {
		return childNodes;
	} else {
		var cur = node.firstChild;
		var nodes = [];
		while (cur) {
			nodes.push(cur);
			cur = cur.nextSibling;
		}
		return nodes;
	}
}

module.exports = namespace.childNodes = childNodes;
