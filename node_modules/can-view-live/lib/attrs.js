"use strict";
// This provides live binding for stache attributes.
var viewCallbacks = require('can-view-callbacks');
var domMutateNode = require('can-dom-mutate/node');
var canReflect = require('can-reflect');

var helpers = require('./helpers');

module.exports = function(el, compute, scope, options) {
	var handlerName = "";
	if (!canReflect.isObservableLike(compute)) {
		// Non-live case (`compute` was not a compute):
		//  set all attributes on the element and don't
		//  worry about setting up live binding since there
		//  is not compute to bind on.
		var attrs = helpers.getAttributeParts(compute);
		for (var name in attrs) {
			domMutateNode.setAttribute.call(el, name, attrs[name]);
		}
		return;
	}

	//!steal-remove-start
	if(process.env.NODE_ENV !== 'production') {
		handlerName = "live.attrs update::"+canReflect.getName(compute);
	}
	//!steal-remove-end


	// last set of attributes
	var oldAttrs = {};


	new helpers.ListenUntilRemovedAndInitialize(compute,
		function canViewLive_updateAttributes(newVal) {
			var newAttrs = helpers.getAttributeParts(newVal),
				name;
			for (name in newAttrs) {
				var newValue = newAttrs[name],
					// `oldAttrs` was set on the last run of setAttrs in this context
					//  (for this element and compute)
					oldValue = oldAttrs[name];
				// Only fire a callback
				//  if the value of the attribute has changed
				if (newValue !== oldValue) {
					// set on DOM attributes (dispatches an "attributes" event as well)
					domMutateNode.setAttribute.call(el, name, newValue);
					// get registered callback for attribute name and fire
					var callback = viewCallbacks.attr(name);
					if (callback) {
						callback(el, {
							attributeName: name,
							scope: scope,
							options: options
						});
					}
				}
				// remove key found in new attrs from old attrs
				delete oldAttrs[name];
			}
			// any attrs left at this point are not set on the element now,
			// so remove them.
			for (name in oldAttrs) {
				domMutateNode.removeAttribute.call(el, name);
			}
			oldAttrs = newAttrs;
		},
		el,
		"dom",
		handlerName);

};
