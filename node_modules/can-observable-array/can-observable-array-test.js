const QUnit = require("steal-qunit");

QUnit.module("can-observable-array", function() {
	require("./test/array-test")();
	require("./test/items-test")();
	require("./test/propdefaults-test")();
	require("./test/steal-import-test");
	require('can-observable-array/test/class-field-test#?can-observable-array/class-fields-support');
});
