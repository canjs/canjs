'use strict';

var QUnit = require('steal-qunit');

var dev = require('./dev');

QUnit.module("can-log/dev");

QUnit.test("stringify", function(assert) {
	assert.strictEqual(dev.stringify(undefined), "undefined");

	assert.ok(/\"foo\": undefined/.test(dev.stringify({ foo: undefined })));

	assert.ok(/\"bar\": undefined/.test(dev.stringify({ foo: undefined,
		bar: undefined })));

	assert.ok(/\"7\": undefined/.test(dev.stringify({ foo: undefined,
		7: undefined, bar: undefined })));
});
