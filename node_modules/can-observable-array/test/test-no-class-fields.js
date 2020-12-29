const QUnit = require("steal-qunit");

QUnit.module("can-observable-array", function() {
	require("./array-test")();
	require("./items-test")();
	require("./propdefaults-test")();
	require("./steal-import-test");
});
