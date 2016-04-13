var $ = require('./jquery-attr'); // jshint ignore:line
var attr = require('can/util/attr/attr');
var isDOM = require('can/util/isDom');
var trigger = require('can/util/util/events').trigger;
var data = require('can/util/data');

module.exports = function() {
	// handle via calls to attr
	var oldAttr = $.attr;
	$.attr = function(el, attrName) {
		if (isDOM(el) && attr.MutationObserver) {
			return oldAttr.apply(this, arguments);
		} else {
			var oldValue, newValue;
			if (arguments.length >= 3) {
				oldValue = oldAttr.call(this, el, attrName);
			}
			var res = oldAttr.apply(this, arguments);
			if (arguments.length >= 3) {
				newValue = oldAttr.call(this, el, attrName);
			}
			if (newValue !== oldValue) {
				attr.trigger(el, attrName, oldValue);
			}
			return res;
		}
	};
	var oldRemove = $.removeAttr;
	$.removeAttr = function(el, attrName) {
		if (isDOM(el) && attr.MutationObserver) {
			return oldRemove.apply(this, arguments);
		} else {
			var oldValue = oldAttr.call(this, el, attrName),
				res = oldRemove.apply(this, arguments);

			if (oldValue != null) {
				attr.trigger(el, attrName, oldValue);
			}
			return res;
		}
	};
	$["event.special.attributes"] = {
		setup: function() {
			if (isDOM(this) && attr.MutationObserver) {
				var self = this;
				var observer = new attr.MutationObserver(function(mutations) {
					mutations.forEach(function(mutation) {
						var copy = $.extend({}, mutation);
						trigger(self, copy, []);
					});

				});
				observer.observe(this, {
					attributes: true,
					attributeOldValue: true
				});
				data($(this), "canAttributesObserver", observer);
			} else {
				data($(this), "canHasAttributesBindings", true);
			}
		},
		teardown: function() {
			if (isDOM(this) && attr.MutationObserver) {
				data($(this), "canAttributesObserver")
					.disconnect();
				$.removeData(this, "canAttributesObserver");
			} else {
				$.removeData(this, "canHasAttributesBindings");
			}

		}
	};
};
