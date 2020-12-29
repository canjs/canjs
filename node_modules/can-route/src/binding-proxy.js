"use strict";
var canReflect = require("can-reflect");
var canSymbol = require("can-symbol");
var SimpleObservable = require("can-simple-observable");

var urlDataObservable = new SimpleObservable(null);

canReflect.setName(urlDataObservable, "route.urlData");

var bindingProxy = {
	defaultBinding: null,
	urlDataObservable: urlDataObservable,
	bindings: {},
	call: function() {
		var args = canReflect.toArray(arguments),
			prop = args.shift(),
			binding = urlDataObservable.value;
		if (binding === null) {
			throw new Error("there is no current binding!!!");
		}
		var method = binding[prop.indexOf("can.") === 0 ? canSymbol.for(prop) : prop];
		if (method.apply) {
			return method.apply(binding, args);
		} else {
			return method;
		}
	}
};
module.exports = bindingProxy;
