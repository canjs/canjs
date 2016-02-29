var can = require('can/util/can');
require('can/util/domless/domless');
require('steal-qunit');

QUnit.module('can/util/domless');

test("can.isArray", function() {
	expect(2);
	ok(!can.isArray(arguments), 'the arguments object is not an array');
	ok(can.isArray([1, 2, 3]), 'but arrays are');
});
