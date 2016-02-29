// # can/view/stache/live.js
//
// This provides live binding for stache attributes.
var can = require('can/util/util');
var live = require('can/view/live/live');
var elements = require('can/view/elements');
var viewCallbacks = require('can/view/callbacks/callbacks');

//??? Can these 3 lines be removed? - BigAB
live = live || can.view.live;
elements = elements || can.view.elements;
viewCallbacks = viewCallbacks || can.view.callbacks;

module.exports = {
	attributes: function(el, compute, scope, options) {
		var oldAttrs = {};

		var setAttrs = function (newVal) {
			var newAttrs = live.getAttributeParts(newVal),
				name;
			for(name in newAttrs) {
				var newValue = newAttrs[name],
					oldValue = oldAttrs[name];
				if(newValue !== oldValue) {
					can.attr.set(el, name, newValue);
					var callback = viewCallbacks.attr(name);
					if(callback) {
						callback(el, {
							attributeName: name,
							scope: scope,
							options: options
						});
					}
				}
				delete oldAttrs[name];
			}
			for(name in oldAttrs) {
				elements.removeAttr(el, name);
			}
			oldAttrs = newAttrs;
		};

		var handler = function (ev, newVal) {
			setAttrs(newVal);
		};

		compute.bind('change', handler);
		can.bind.call(el, 'removed', function() {
			compute.unbind('change', handler);
		});

		// current value has been set
		setAttrs(compute());
	}
};
