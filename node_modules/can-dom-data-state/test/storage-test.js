var QUnit = require('steal-qunit');
var domDataState = require('../can-dom-data-state');

var foo = {};
var bar = {};

QUnit.module('can-dom-data-state: storage', {
	beforeEach: function () {
		domDataState.delete();
	}
});

QUnit.test('should set and get data', function (assert) {
	domDataState.set('foo', foo);
	assert.equal(domDataState.get('foo'), foo);
});

QUnit.test('set() should return the store', function (assert) {
	var foo = {};
	assert.deepEqual(
		domDataState.set.call(foo, 'hammer', 'time'),
		{hammer: 'time'},
		'should set the store and return it'
	);
	domDataState.delete.call(foo);
});

QUnit.test('get() should return the whole store', function (assert) {
	var foo = {};
	assert.equal(domDataState.get.call(foo), undefined, 'should have no store initially');

	domDataState.set.call(foo, 'bar', 'baz');
	assert.deepEqual(domDataState.get.call(foo), {bar: 'baz'}, 'should return set store');

	domDataState.delete.call(foo);
	assert.equal(domDataState.get.call(foo), undefined, 'should have no store finally');
});

QUnit.test('should delete node', function (assert) {
	domDataState.set('foo', foo);
	domDataState.set('bar', bar);
	assert.equal(domDataState.get('foo'), foo);
	assert.equal(domDataState.get('bar'), bar);
	domDataState.delete();
	assert.equal(domDataState._data.get(domDataState), undefined);
});

QUnit.test('should delete all data of node', function (assert) {
	domDataState.set('foo', foo);
	domDataState.set('bar', bar);
	assert.equal(domDataState.get('foo'), foo);
	assert.equal(domDataState.get('bar'), bar);
	domDataState.clean('foo');
	domDataState.clean('bar');
	assert.equal(domDataState.get('foo'), undefined);
	assert.equal(domDataState.get('bar'), undefined);
	assert.equal(domDataState._data.get(domDataState), undefined);
});
