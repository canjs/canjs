"use strict";
var deparam = require("can-deparam");
var canReflect = require("can-reflect");

var bindingProxy = require("./binding-proxy");
var register = require("./register");

// ## Helper Functions

// ### decode
// Restore escaped HTML from its URI value.
// It isn't compatable with named character references (`&copy;`, etc).
function decode(str) {
	try {
		return decodeURIComponent(str);
	} catch(ex) {
		return unescape(str);
	}
}

// ### toURLFragment
// If the `root` ends with `/` and the url starts with it, remove `/`.
// TODO: I'm not totally sure this belongs here. This might be shifted to can-route-pushstate.
function toURLFragment(url) {
	var root = bindingProxy.call("root");
	if (root.lastIndexOf("/") === root.length - 1 && url.indexOf("/") === 0) {
		url = url.substr(1);
	}
	return url;
}

// ### canRoute_getRule
function canRoute_getRule(url) {
	url = toURLFragment(url);
	// See if the url matches any routes by testing it against the `route.test` `RegExp`.
	// By comparing the URL length the most specialized route that matches is used.
	var route = {
		length: -1
	};
	canReflect.eachKey(register.routes, function(temp, name) {
		if (temp.test.test(url) && temp.length > route.length) {
			route = temp;
		}
	});
	// If a route was matched.
	if (route.length > -1) {
		return route;
	}
}

function canRoute_deparam(url) {

	var route = canRoute_getRule(url),
		querySeparator = bindingProxy.call("querySeparator"),
		paramsMatcher = bindingProxy.call("paramsMatcher");

	url = toURLFragment(url);

	// If a route was matched.
	if (route) {
		// Since `RegExp` backreferences are used in `route.test` (parens)
		// the parts will contain the full matched string and each variable (back-referenced) value.
		var parts = url.match(route.test),
			// Start will contain the full matched string; parts contain the variable values.
			start = parts.shift(),
			// The remainder will be the `&amp;key=value` list at the end of the URL.
			remainder = url.substr(start.length - (parts[parts.length - 1] === querySeparator ? 1 : 0)),
			// If there is a remainder and it contains a `&amp;key=value` list deparam it.
			obj = (remainder && paramsMatcher.test(remainder)) ? deparam(remainder.slice(1)) : {};

		// Add the default values for this route.
		obj = canReflect.assignDeep(canReflect.assignDeep({}, route.defaults), obj);
		// Overwrite each of the default values in `obj` with those in
		// parts if that part is not empty.
		parts.forEach(function (part, i) {
			if (part && part !== querySeparator) {
				obj[route.names[i]] = decode(part);
			}
		});
		return obj;
	}
	// If no route was matched, it is parsed as a `&amp;key=value` list.
	if (url.charAt(0) !== querySeparator) {
		url = querySeparator + url;
	}
	return paramsMatcher.test(url) ? deparam(url.slice(1)) : {};
}

canRoute_deparam.getRule = canRoute_getRule;

module.exports = canRoute_deparam;
