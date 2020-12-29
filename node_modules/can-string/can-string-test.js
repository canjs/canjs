'use strict';

var QUnit = require('steal-qunit');
var string = require('./can-string');

QUnit.module("can-string");


QUnit.test('String.underscore', function (assert) {
	assert.equal(string.underscore('Foo.Bar.ZarDar'), 'foo.bar.zar_dar');
});



QUnit.test('string.esc', function (assert) {
	var text = string.esc(0);
	assert.equal(text, '0', '0 value properly rendered');
	text = string.esc(null);
	assert.deepEqual(text, '', 'null value returns empty string');
	text = string.esc();
	assert.deepEqual(text, '', 'undefined returns empty string');
	text = string.esc(NaN);
	assert.deepEqual(text, '', 'NaN returns empty string');
	text = string.esc('<div>&nbsp;</div>');
	assert.equal(text, '&lt;div&gt;&amp;nbsp;&lt;/div&gt;', 'HTML escaped properly');
});

QUnit.test('string.camelize', function (assert) {
	var text = string.camelize(0);
	assert.equal(text, '0', '0 value properly rendered');
	text = string.camelize(null);
	assert.equal(text, '', 'null value returns empty string');
	text = string.camelize();
	assert.equal(text, '', 'undefined returns empty string');
	text = string.camelize(NaN);
	assert.equal(text, '', 'NaN returns empty string');
	text = string.camelize('-moz-index');
	assert.equal(text, 'MozIndex');
	text = string.camelize('foo-bar');
	assert.equal(text, 'fooBar');
});

QUnit.test('string.hyphenate', function (assert) {
	var text = string.hyphenate(0);
	assert.equal(text, '0', '0 value properly rendered');
	text = string.hyphenate(null);
	assert.equal(text, '', 'null value returns empty string');
	text = string.hyphenate();
	assert.equal(text, '', 'undefined returns empty string');
	text = string.hyphenate(NaN);
	assert.equal(text, '', 'NaN returns empty string');
	text = string.hyphenate('ABC');
	assert.equal(text, 'ABC');
	text = string.hyphenate('dataNode');
	assert.equal(text, 'data-node');
});

QUnit.test('string.pascalize', function (assert) {
	var text = string.pascalize(0);
	assert.equal(text, '0', '0 value properly rendered');
	text = string.pascalize(null);
	assert.equal(text, '', 'null value returns empty string');
	text = string.pascalize();
	assert.equal(text, '', 'undefined returns empty string');
	text = string.pascalize(NaN);
	assert.equal(text, '', 'NaN returns empty string');
	text = string.pascalize('baz-bar');
	assert.equal(text, 'BazBar');
	text = string.pascalize('barNode');
	assert.equal(text, 'BarNode');
	text = string.pascalize('bar');
	assert.equal(text, 'Bar');
});
