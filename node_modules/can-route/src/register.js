"use strict";
// This file contains the function that allows the registration of routes
var canReflect = require("can-reflect");

var dev = require("can-log/dev/dev");

var bindingProxy = require("./binding-proxy");
var regexps = require("./regexps");

var diff = require("can-diff/list/list");
var diffObject = require("can-diff/map/map");

// `RegExp` used to match route variables of the type '{name}'.
// Any word character or a period is matched.

// ### removeBackslash
// Removes all backslashes (`\`) from a string.
function removeBackslash(string) {
	return string.replace(/\\/g, "");
}

// ### wrapQuote
// Converts input to a string and readies string for regex
// input by escaping the following special characters: `[ ] ( ) { } \ ^ $ . | ? * +`.
function wrapQuote(string) {
	return (string + "")
		.replace(/([.?*+\^$\[\]\\(){}|\-])/g, "\\$1");
}

var RouteRegistry = {
	routes:  {},
	register: function(url, defaults) {
		// If the root ends with a forward slash (`/`)
		// and url starts with a forward slash (`/`), remove the leading
		// forward slash (`/`) of the url.
		var root = bindingProxy.call("root");

		if ( root.lastIndexOf("/") === root.length - 1 && url.indexOf("/") === 0 ) {
			url = url.substr(1);
		}

		// `matcher` will be a regex
		// fall back to legacy `:foo` RegExp if necessary
		var matcher;
		if (regexps.colon.test(url)) {
			//!steal-remove-start
			if (process.env.NODE_ENV !== "production") {
				dev.warn("update route \"" + url + "\" to \"" + url.replace(regexps.colon, function(name, key) {
					return "{" + key + "}";
				}) + "\"");
			}
			//!steal-remove-end

			matcher = regexps.colon;
		} else {
			matcher = regexps.curlies;
		}

		defaults = defaults || {};

		// Extract the variable names and replace with `RegExp` that will match
		// an actual URL with values.
		var lastIndex = matcher.lastIndex = 0,
			names = [],
			res,
			test = "",
			next,
			querySeparator = bindingProxy.call("querySeparator"),
			matchSlashes = bindingProxy.call("matchSlashes");

		// res will be something like ["{foo}","foo"]
		while (res = matcher.exec(url)) {
			names.push(res[1]);
			test += removeBackslash(url.substring(lastIndex, matcher.lastIndex - res[0].length));
			// If matchSlashes is false (the default) don't greedily match any slash in the string, assume its part of the URL
			next = "\\" + (removeBackslash(url.substr(matcher.lastIndex, 1)) || querySeparator+(matchSlashes? "": "|/"));
			// A name without a default value HAS to have a value.
			// A name that has a default value can be empty.
			// The `\\` is for string-escaping giving single `\` for `RegExp` escaping.
			test += "([^" + next + "]" + (defaults[res[1]] ? "*" : "+") + ")";
			lastIndex = matcher.lastIndex;
		}
		test += removeBackslash(url.substr(lastIndex));

		//!steal-remove-start
		if (process.env.NODE_ENV !== "production") {
			// warn if new route uses same map properties as an existing route
			canReflect.eachKey(RouteRegistry.routes, function(r) {
				var existingKeys = r.names.concat(Object.keys(r.defaults)).sort(),
					keys = names.concat(Object.keys(defaults)).sort(),
					sameMapKeys = !diff(existingKeys, keys).length,
					sameDefaultValues = !diffObject(r.defaults, defaults).length,
					//the regex removes the trailing slash
					matchingRoutesWithoutTrailingSlash = r.route.replace(/\/$/, "") === url.replace(/\/$/, "");

				if (sameMapKeys && sameDefaultValues && !matchingRoutesWithoutTrailingSlash) {
					dev.warn("two routes were registered with matching keys:\n" +
						"\t(1) route.register(\"" + r.route + "\", " + JSON.stringify(r.defaults) + ")\n" +
						"\t(2) route.register(\"" + url + "\", " + JSON.stringify(defaults) + ")\n" +
						"(1) will always be chosen since it was registered first");
				}
			});
		}
		//!steal-remove-end

		// Add route in a form that can be easily figured out.
		return RouteRegistry.routes[url] = {
			// A regular expression that will match the route when variable values
			// are present; i.e. for (`{page}/{type}`) the `RegExp` is `/([\w\.]*)/([\w\.]*)/` which
			// will match for any value of `{page}` and `{type}` (word chars or period).
			test: new RegExp("^" + test + "($|" + wrapQuote(querySeparator) + ")"),
			// The original URL, same as the index for this entry in routes.
			route: url,
			// An `array` of all the variable names in this route.
			names: names,
			// Default values provided for the variables.
			defaults: defaults,
			// The number of parts in the URL separated by `/`.
			length: url.split("/").length
		};
	}
};

module.exports = RouteRegistry;
