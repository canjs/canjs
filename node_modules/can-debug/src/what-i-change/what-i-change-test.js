var QUnit = require("steal-qunit");
var logWhatIChange = require("./what-i-change");

QUnit.module("logWhatIChange");

QUnit.test("it is a function", function(assert) {
	assert.equal(typeof logWhatIChange, "function");
});
