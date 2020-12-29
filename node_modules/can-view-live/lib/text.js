"use strict";
var canReflect = require('can-reflect');
var helpers = require('./helpers');

/**
 * @function can-view-live.text text
 * @parent can-view-live
 * @release 2.0.4
 *
 * @signature `live.text(el, compute)`
 *
 * Replaces one element with some content while keeping [can-view-live.nodeLists nodeLists] data correct.
 */
module.exports = function(el, compute) {
	var handlerName = "";

	//!steal-remove-start
	if(process.env.NODE_ENV !== 'production') {
		if(arguments.length > 2) {
			// TODO: remove
			throw new Error("too many arguments");

		}
		handlerName = "live.text update::"+canReflect.getName(compute);
	}
	//!steal-remove-end

	// TODO: we can remove this at some point
	if (el.nodeType !== Node.TEXT_NODE) {
		var textNode;

		textNode = document.createTextNode("");
		el.parentNode.replaceChild(textNode, el);
		el = textNode;

	}

	new helpers.ListenUntilRemovedAndInitialize(compute, function liveTextUpdateTextNode(newVal) {
		el.nodeValue = helpers.makeString(newVal);
	},
	el,
	"dom", // TODO: should this still be domUI?
	handlerName);
};
