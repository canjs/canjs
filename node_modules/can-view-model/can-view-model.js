"use strict";

var SimpleMap = require("can-simple-map");
var ns = require("can-namespace");
var getDocument = require("can-globals/document/document");
var canReflect = require("can-reflect");
var canSymbol = require('can-symbol');

var viewModelSymbol = canSymbol.for('can.viewModel');

module.exports = ns.viewModel = function (el, attr, val) {
	if (typeof el === "string") {
		el = getDocument().querySelector(el);
	} else if (canReflect.isListLike(el) && !el.nodeType) {
		el = el[0];
	}

	if (canReflect.isObservableLike(attr) && canReflect.isMapLike(attr)) {
		el[viewModelSymbol] = attr;
		return;
	}

	var scope = el[viewModelSymbol];
	if(!scope) {
		scope = new SimpleMap();
		el[viewModelSymbol] = scope;
	}
	switch (arguments.length) {
		case 0:
		case 1:
			return scope;
		case 2:
			return canReflect.getKeyValue(scope, attr);
		default:
			canReflect.setKeyValue(scope, attr, val);
			return el;
	}
};
