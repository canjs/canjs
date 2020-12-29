var makeMap = require('./can-make-map');
var QUnit = require('steal-qunit');

QUnit.module("can-make-map");

QUnit.test("basics", function(assert) {
	var res = makeMap("a,b,c");
	assert.deepEqual(res, { a: true, b: true, c: true });
	assert.ok(res instanceof Object);
});
