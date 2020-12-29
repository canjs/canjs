var QUnit = require("steal-qunit");
var mod = require("./mod");

QUnit.module("some module");

QUnit.test("some test", function(assert){
	assert.equal(mod, 2, "mod has the right value");
});
