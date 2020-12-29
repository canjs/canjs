'use strict';

var QUnit = require('../../test-wrapper');
var isNode = require('./is-node');

QUnit.module("can-globals/is-node/is-node");

QUnit.test("basics", function(assert){
	assert.equal(typeof isNode(), "boolean");
});
