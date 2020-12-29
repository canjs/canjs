var QUnit = require('steal-qunit');
var domData = require('../can-dom-data');

var node = {};
var foo = {};
var bar = {};

QUnit.module('can-dom-data', {
	beforeEach: function () {
		domData.delete(node);
	}
});

QUnit.test('should set and get data', function (assert) {
	domData.set(node, 'foo', foo);
	assert.equal(domData.get(node, 'foo'), foo);
});

QUnit.test('set() should return the store', function (assert) {
	var foo = {};
	assert.deepEqual(
		domData.set(foo, 'hammer', 'time'),
		{hammer: 'time'},
		'should set the store and return it'
	);
	domData.delete(foo);
});

QUnit.test('get() should return the whole store', function (assert) {
	var foo = {};
	assert.equal(domData.get(foo), undefined, 'should have no store initially');

	domData.set(foo, 'bar', 'baz');
	assert.deepEqual(domData.get(foo), {bar: 'baz'}, 'should return set store');

	domData.delete(foo);
	assert.equal(domData.get(foo), undefined, 'should have no store finally');
});

QUnit.test('should delete node', function (assert) {
	domData.set(node, 'foo', foo);
	domData.set(node, 'bar', bar);
	assert.equal(domData.get(node, 'foo'), foo);
	assert.equal(domData.get(node, 'bar'), bar);
	domData.delete(node);
	assert.equal(domData._data.get(node), undefined);
});

QUnit.test('should delete all data of node', function (assert) {
	domData.set(node, 'foo', foo);
	domData.set(node, 'bar', bar);
	assert.equal(domData.get(node, 'foo'), foo);
	assert.equal(domData.get(node, 'bar'), bar);
	domData.clean(node, 'foo');
	domData.clean(node, 'bar');
	assert.equal(domData.get(node, 'foo'), undefined);
	assert.equal(domData.get(node, 'bar'), undefined);
	assert.equal(domData._data.get(node), undefined);
});
