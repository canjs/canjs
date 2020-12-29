"use strict";
var bindingProxy = require("./binding-proxy");
var routeDeparam = require("./deparam");
var routeParam = require("./param");
var canReflect = require("can-reflect");
var string = require("can-string");

// ### formatAttributes
// Creates HTML-like attributes from an object.
// It escapes hyperlink references.
function formatAttributes(props) {
	var tags = [];
	canReflect.eachKey(props, function(value, name) {
		// Converts `"className"` to `"class"`.
		var attributeName = name === "className" ? "class" : name,

			// Escapes `value` if `name` is `"href"`.
			attributeValue = name === "href" ? value : string.esc(value);

		tags.push(attributeName + "=\"" + attributeValue + "\"");
	});
	return tags.join(" ");
}

// ### matchCheck
// It recursively compares property values in `matcher` to those in `source`.
// It returns `false` if there's a property in `source` that's not in `matcher`,
// or if the two values aren't loosely equal.
function matchCheck(source, matcher) {
	/*jshint eqeqeq:false*/
	for(var property in source) {
		var sourceProperty = source[property],
			matcherProperty = matcher[property];

		if (sourceProperty && matcherProperty &&
			typeof sourceProperty === "object" && typeof matcher === "object"
		) {
			return matchCheck(sourceProperty, matcherProperty);
		}

		if (sourceProperty != matcherProperty) {
			return false;
		}
	}
	return true;
}

// ### canRoute_url
function canRoute_url(options, merge) {
	if (merge) {
		var baseOptions = routeDeparam( bindingProxy.call("can.getValue") );
		options = canReflect.assignMap(canReflect.assignMap({}, baseOptions), options);
	}
	return bindingProxy.call("root") + routeParam(options);
}

module.exports = {
	url: canRoute_url,

	link: function canRoute_link(name, options, props, merge) {
		return "<a " + formatAttributes(
			canReflect.assignMap({
				href: canRoute_url(options, merge)
			}, props)) + ">" + name + "</a>";
	},

	isCurrent: function canRoute_isCurrent(options, subsetMatch) {
		var getValueSymbol = bindingProxy.call("can.getValue");

		if (subsetMatch) {
			// Everything in `options` shouhld be in `baseOptions`.
			var baseOptions = routeDeparam( getValueSymbol );
			return matchCheck(options, baseOptions);
		} else {
			return getValueSymbol === routeParam(options);
		}
	}
};
