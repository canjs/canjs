const QUnit = require("steal-qunit");
const mixinViewModelSymbol = require("./mixin-viewmodel-symbol");
const viewModelSymbol = Symbol.for("can.viewModel");

QUnit.module("can-stache-element - mixin-viewmodel-symbol");

QUnit.test("basics", function(assert) {
	class App extends mixinViewModelSymbol(class A {}) {}

	const app = new App();
	assert.equal(app[viewModelSymbol], app, "instances get assigned viewModel Symbol");
});
