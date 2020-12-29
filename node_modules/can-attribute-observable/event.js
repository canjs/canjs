"use strict";
var canReflect = require("can-reflect");
var domEvents = require("can-dom-events");
var isDomEventTarget = require("can-dom-events/helpers/util").isDomEventTarget;

var canEvent = {
	on: function on(eventName, handler, queue) {
		if (isDomEventTarget(this)) {
			domEvents.addEventListener(this, eventName, handler, queue);
		} else {
			canReflect.onKeyValue(this, eventName, handler, queue);
		}
	},
	off: function off(eventName, handler, queue) {
		if (isDomEventTarget(this)) {
			domEvents.removeEventListener(this, eventName, handler, queue);
		} else {
			canReflect.offKeyValue(this, eventName, handler, queue);
		}
	},
	one: function one(event, handler, queue) {
		// Unbind the listener after it has been executed
		var one = function() {
			canEvent.off.call(this, event, one, queue);
			return handler.apply(this, arguments);
		};

		// Bind the altered listener
		canEvent.on.call(this, event, one, queue);
		return this;
	}
};

module.exports = canEvent;
