var QUnit = require("steal-qunit");

QUnit.module("some module");

QUnit.test("First test", function(assert){
	assert.ok(true, "test one");
});

QUnit.test("Second test", function(assert){
	assert.ok(true, "test two");
});
