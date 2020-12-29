"use strict";
var attr = require("./behaviors");

var isRadioInput = function isRadioInput(el) {
	return el.nodeName.toLowerCase() === "input" && el.type === "radio";
};

// Determine the event or events we need to listen to when this value changes.
module.exports = function getEventName(el, prop) {
	var event = "change";

	if (isRadioInput(el) && prop === "checked" ) {
		event = "can-attribute-observable-radiochange";
	}

	if (attr.findSpecialListener(prop)) {
		event = prop;
	}

	return event;
};
