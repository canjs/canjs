var QUnit = require("steal-qunit");

QUnit.module("some module");

QUnit.test("Failing test", function(assert){
	assert.equal(1, 2);
});

QUnit.test("Passing test", function(assert){
	assert.equal(2, 2);
});
