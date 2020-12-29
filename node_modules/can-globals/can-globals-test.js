'use strict';
var Globals = require('./can-globals-proto');
var QUnit = require('./test-wrapper');
var spy = require('./spy');
var globals;

function mapEvents(spy){
	return spy.calls.reduce(function(acc, cur) {
		return acc.concat(cur.calledWith[0]);
	},  []);
}

function loop(fn, count, ctx){
	for(var i = count; i > 0; i--){
		if(ctx){
			fn.call(ctx, i);
			continue;
		}
		fn(i);
	}
}

QUnit.module('can-globals/can-globals-proto');

QUnit.test('getKeyValue of undefined property', function(assert) {
	globals = new Globals();
	globals.getKeyValue('test');
	assert.ok(true);
});

QUnit.test('setKeyValue of undefined property', function(assert) {
	globals = new Globals();
	globals.setKeyValue('foo', 'bar');
	assert.equal(globals.getKeyValue('foo'), 'bar');
});

QUnit.test('deleteKeyValue of undefined property', function(assert) {
	globals = new Globals();
	globals.deleteKeyValue('test');
	assert.ok(true);
});

QUnit.test('onKeyValue of undefined property', function(assert) {
	globals = new Globals();
	globals.onKeyValue('test', function() {});
	assert.ok(true);
	globals.offKeyValue('test');
});

QUnit.test('offKeyValue of undefined property', function(assert) {
	globals = new Globals();
	globals.offKeyValue('test', function() {});
	assert.ok(true);
});

QUnit.test('makeExport of undefined property', function(assert) {
	globals = new Globals();
	globals.makeExport('test');
	assert.ok(true);
});

QUnit.test('define with cache disabled', function(assert) {
	var getter = spy('bar');
	globals = new Globals();
	globals.define('foo', getter, false);
	loop(function(){
		globals.getKeyValue('foo');
	}, 5);
	assert.equal(getter.callCount, 5);
});

QUnit.test('define with cache enabled', function(assert) {
	var getter = spy('bar');
	globals = new Globals();
	globals.define('foo', getter);
	loop(function(){
		globals.getKeyValue('foo');
	}, 5);
	assert.equal(getter.callCount, 1);
});

QUnit.test('define and get a new property', function(assert) {
	globals = new Globals();
	globals.define('test', 'default');
	assert.equal(globals.getKeyValue('test'), 'default');
});

QUnit.test('setKeyValue of existing property to string', function(assert) {
	globals = new Globals();
	globals.define('test', 'default');
	globals.setKeyValue('test', 'updated');
	assert.equal(globals.getKeyValue('test'), 'updated');
});

QUnit.test('setKeyValue of existing property to undefined', function(assert) {
	globals = new Globals();
	globals.define('test', 'default');
	globals.setKeyValue('test', undefined);
	assert.equal(globals.getKeyValue('test'), undefined);
});

QUnit.test('setKeyValue of existing property to a function', function(assert) {
	globals = new Globals();
	globals.define('test', 'default');
	globals.setKeyValue('test', function(){
		return 'foo';
	});
	assert.equal(globals.getKeyValue('test'), 'foo');
});

QUnit.test('setKeyValue on an existing property should reset cache', function(assert) {
	var globals = new Globals();
	var bar = function() {
		return 'bar';
	};
	globals.define('foo', bar);
	globals.getKeyValue('foo');
	globals.setKeyValue('foo', function(){
		return 'baz';
	});
	assert.equal(globals.getKeyValue('foo'), 'baz');
});

QUnit.test('deleteKeyValue to reset property to default', function(assert) {
	var globals = new Globals();
	globals.define('test', 'default');
	globals.setKeyValue('test', 'updated');
	globals.deleteKeyValue('test');
	assert.equal(globals.getKeyValue('test'), 'default');
});

QUnit.test('deleteKeyValue should clear cache', function(assert) {
	var globals = new Globals();
	var bar = spy('bar');
	globals.define('foo', bar);
	globals.getKeyValue('foo');
	globals.setKeyValue('foo', function(){
		return 'baz';
	});
	globals.deleteKeyValue('foo');
	globals.getKeyValue('foo');
	assert.equal(bar.callCount, 2);
});

QUnit.test('listen for key change', function(assert) {
	var globals = new Globals();
	var handler = spy();
	globals.define('test', 'default');
	globals.define('foo', 'bar');
	globals.onKeyValue('test', handler);
	globals.setKeyValue('test', 'updated');
	globals.setKeyValue('foo', 'baz');
	globals.deleteKeyValue('test');
	assert.equal(handler.callCount, 2);
	assert.deepEqual(mapEvents(handler), [
		'updated',
		'default'
	]);
	globals.offKeyValue('test');
});

QUnit.test('remove event listener for key', function(assert) {
	var globals = new Globals();
	var handler = spy();
	globals.define('test', 'foo');
	globals.onKeyValue('test', handler);
	globals.offKeyValue('test', handler);
	globals.setKeyValue('test', 'updated');
	assert.equal(handler.callCount, 0);
});

QUnit.test('makeExport of key', function(assert) {
	var globals = new Globals();
	globals.define('foo', 'bar');
	var e = globals.makeExport('foo');
	assert.equal(e(), 'bar');
	e('baz');
	assert.equal(e(), 'baz');
	e(undefined);
	assert.equal(e(), 'bar');
});

QUnit.test('reset export value with null (can-stache#288)', function(assert) {
	var globals = new Globals();
	globals.define('foo', 'bar');
	var e = globals.makeExport('foo');
	assert.equal(e(), 'bar');
	e('baz');
	assert.equal(e(), 'baz');
	e(null);
	assert.equal(e(), 'bar');
});

QUnit.test('reset cleares cache on all keys', function(assert) {
	var globals = new Globals();
	var bar = spy('bar');
	var qux = spy('qux');
	globals.define('foo', bar);
	globals.define('baz', qux);
	loop(function(){
		globals.getKeyValue('foo');
		globals.getKeyValue('baz');
	}, 5);
	globals.reset();
	loop(function(){
		globals.getKeyValue('foo');
		globals.getKeyValue('baz');
	}, 5);
	assert.equal(bar.callCount, 2);
	assert.equal(qux.callCount, 2);
});

QUnit.test('reset should reset all keys to default value (#31)', function(assert) {
	var globals = new Globals();
	globals.define('foo', 'bar');
	globals.define('baz', 'qux');
	globals.setKeyValue('foo', 'red');
	globals.setKeyValue('baz', 'green');
	globals.reset();
	assert.equal(globals.getKeyValue('foo'), 'bar');
	assert.equal(globals.getKeyValue('baz'), 'qux');
});

QUnit.test('reset triggers events', function(assert) {
	var globals = new Globals();
	var fooHandler = spy();
	var barHandler = spy();
	globals.define('foo', true);
	globals.define('bar', true);
	globals.setKeyValue('foo', false);
	globals.setKeyValue('bar', false);
	globals.onKeyValue('foo', fooHandler);
	globals.onKeyValue('bar', barHandler);
	globals.reset();
	assert.equal(fooHandler.callCount, 1);
	assert.equal(barHandler.callCount, 1);
	globals.offKeyValue('foo');
	globals.offKeyValue('bar');
});

QUnit.test('export helper value can be set to a function', function(assert) {
	var globals = new Globals();
	var foo = spy();
	globals.setKeyValue('foo', function(){
		return function(){};
	});
	var fooExport = globals.makeExport('foo');
	fooExport(foo);
	assert.equal(typeof fooExport(), 'function');
	assert.equal(foo.callCount, 0);
	fooExport()();
	assert.equal(foo.callCount, 1);
});


QUnit.test('onKeyValue should dispatch the resolved value (#29)', function(assert) {
	var globals = new Globals();
	var foo = 'foo';
	globals.define('foo', '');
	globals.onKeyValue('foo', function(value){
		assert.equal(value, foo);
	});
	globals.setKeyValue('foo', function(){
		return foo;
	});
	globals.offKeyValue('foo');
});

QUnit.test('onKeyValue should not trigger multiple calls of the value function (#33)', function(assert) {
	var globals = new Globals();
	var baz = spy('baz');
	globals.define('foo', 'bar');
	globals.onKeyValue('foo', function(){});
	globals.setKeyValue('foo', baz);
	globals.getKeyValue('foo');
	assert.equal(baz.callCount, 1);
});
