"use strict";

const defineLazyValue = require("can-define-lazy-value");
const viewModelSymbol = Symbol.for("can.viewModel");

module.exports = function mixinViewModelSymbol(BaseClass = HTMLElement) {
	class ViewModelClass extends BaseClass {}

	// can-stache-bindings uses viewModel symbol
	defineLazyValue(ViewModelClass.prototype, viewModelSymbol, function() {
		return this;
	});

	return ViewModelClass;
};
