'use strict';

var QUnit = require('../../test-wrapper');
var isWebWorker = require('./is-web-worker');

QUnit.module("can-globals/is-web-worker/is-web-worker");

QUnit.test("basics", function(assert) {
	assert.equal(typeof isWebWorker(), "boolean");
});
