var QUnit = require("steal-qunit");
var logWhatChangesMe = require("./what-changes-me");

QUnit.module("logWhatChangesMe");

QUnit.test("it is a function", function(assert) {
	assert.equal(typeof logWhatChangesMe, "function");
});
