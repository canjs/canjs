var QUnit = require('steal-qunit');
var CSSStyleDeclaration = require('../lib/document/style');

QUnit.module("can-simple-dom - CSStyleDeclaration");

QUnit.test("cssText is enumerable", function(assert) {
	var proto = CSSStyleDeclaration.prototype;
	var descriptor = Object.getOwnPropertyDescriptor(proto, "cssText");
	assert.equal(descriptor.enumerable, true, "it is enumerable");
});

QUnit.test("cssText is configurable", function(assert) {
	var proto = CSSStyleDeclaration.prototype;
	var descriptor = Object.getOwnPropertyDescriptor(proto, "cssText");
	assert.equal(descriptor.configurable, true, "it is configurable");
});

QUnit.test('getPropertyValue must be a function', function(assert) {
	var proto = CSSStyleDeclaration.prototype;
	assert.equal(typeof proto.getPropertyValue, 'function', 'it is a function');
});
