"use strict";
var canReflect = require('can-reflect');
var attr = require("can-attribute-observable/behaviors");
var helpers = require('./helpers');

/**
 * @function can-view-live.attr attr
 * @parent can-view-live
 *
 * @signature `live.attr(el, attributeName, observable)`
 *
 * Keep an attribute live to a [can-reflect]-ed observable.
 *
 * ```js
 * var div = document.createElement('div');
 * var value = new SimpleObservable("foo bar");
 * live.attr(div,"class", value);
 * ```
 *
 * @param {HTMLElement} el The element whos attribute will be kept live.
 * @param {String} attributeName The attribute name.
 * @param {Object} observable An observable value.
 *
 * @body
 *
 * ## How it works
 *
 * This listens for the changes in the observable and uses those changes to
 * set the specified attribute.
 */
module.exports = function(el, attributeName, compute) {
	var handlerName = "";
	//!steal-remove-start
	if(process.env.NODE_ENV !== 'production') {
		// register that the handler changes the parent element
		handlerName = "live.attr update::"+canReflect.getName(compute);
	}
	//!steal-remove-end

	new helpers.ListenUntilRemovedAndInitialize(compute,
			function liveUpdateAttr(newVal) {
				attr.set(el,attributeName, newVal);
			},
			el,
			"dom",
			handlerName
		);
};
