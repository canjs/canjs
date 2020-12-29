'use strict';

var QUnit = require('steal-qunit');
var DefineMap = require('can-define/map/map');
var singleton = require('./can-define-connected-singleton');

QUnit.module('can-define-connected-singleton');

QUnit.test('Works as a simple class @decorator', function(assert){
	var MyType = DefineMap.extend({});
	var Decorated = singleton(MyType);

	assert.equal(MyType, Decorated);
	assert.ok(Decorated.hasOwnProperty('current'));
	assert.ok(Decorated.hasOwnProperty('currentPromise'));
});

QUnit.test('Works as a @decorator({ with_options })', function(assert){
	var MyType = DefineMap.extend({});
	var factory = singleton({});
	var Decorated = factory(MyType);

	assert.equal(MyType, Decorated);
	assert.ok(Decorated.hasOwnProperty('current'));
	assert.ok(Decorated.hasOwnProperty('currentPromise'));
});

QUnit.test('Allows configurable property names', function(assert){
	var MyType = DefineMap.extend({});
	var Decorated = singleton({ currentPropertyName: 'foo', savingPropertyName: 'bar' })(MyType);

	assert.ok(Decorated.hasOwnProperty('bar'));
	assert.ok(Decorated.hasOwnProperty('foo'));
	assert.ok(Decorated.hasOwnProperty('fooPromise'));
	assert.notOk(Decorated.hasOwnProperty('current'));
	assert.notOk(Decorated.hasOwnProperty('currentPromise'));
});

QUnit.test('Calling "current" makes call to Type.get()', function(assert){
	// ensure that get() is only called once
	assert.expect(3);
	var done = assert.async();
	var MyType = DefineMap.extend({
		get: function() {
			assert.ok(true, 'get was called');
			return Promise.resolve('the value!');
		}
	}, {});

	var Decorated = singleton(MyType);

	assert.equal(Decorated.current, undefined, 'initially undefined');
	Decorated.currentPromise.then(function() {
		assert.equal(Decorated.current, 'the value!', 'has the expected value');
		done();
	});
});

QUnit.test('Allows for configurable data method name', function(assert){
	assert.expect(3);
	var done = assert.async();
	var MyType = DefineMap.extend({
		doFooBar: function() {
			assert.ok(true, 'doFooBar was called');
			return Promise.resolve('the value!');
		}
	}, {});

	var Decorated = singleton({ fetchMethodName: 'doFooBar' })(MyType);

	assert.equal(Decorated.current, undefined, 'initially undefined');
	Decorated.currentPromise.then(function() {
		assert.equal(Decorated.current, 'the value!', 'has the expected value');
		done();
	});
});

QUnit.test('Saving a new instance updates the "current" and "saving" properties', function(assert){
	assert.expect(6);
	var done = assert.async();
	var MyType = singleton(
		DefineMap.extend({ 
			get: function() {
				assert.ok(true, 'Get called but returns undefined. Should only happen once during this test.');
				return Promise.resolve(undefined);
			},
		}, {
			save: function() {
				return new Promise((resolve) => {
					setTimeout(() => resolve(this), 100);
				});
			}
		})
	);

	var instance = new MyType();
	assert.notEqual(MyType.current, instance);
	var promise = instance.save();
	assert.equal(MyType.saving, instance);

	promise.then(() => {
		assert.equal(MyType.current, instance);
		assert.notEqual(MyType.saving, instance);

		MyType.currentPromise.then(function(value) {
			assert.equal(value, instance);
			done();
		});
	});
});

QUnit.test('Allows for configurable save method name', function(assert){
	assert.expect(4);
	var done = assert.async();
	var MyType = singleton({ createMethodName: 'doFooBar' })(
		DefineMap.extend({
			get: function() {
				assert.ok(true, 'Get called but returns undefined. Should only happen once during this test.');
				return Promise.resolve(undefined);
			},
		}, {
			doFooBar: function() {
				return Promise.resolve(this);
			}
		})
	);

	var instance = new MyType();
	assert.notEqual(MyType.current, instance);

	instance.doFooBar().then(() => {
		assert.equal(MyType.current, instance);

		MyType.currentPromise.then(function(value) {
			assert.equal(value, instance);
			done();
		});
	});
});

QUnit.test('Destroying sets the "current" property to undefined, with rejected promise', function(assert){
	var done = assert.async();
	assert.expect(2);
	var MyType = singleton(
		DefineMap.extend({ 
			get: function() {
				return Promise.resolve();
			}
		}, {
			save: function() {
				return Promise.resolve(this);
			},
			destroy: function() {
				return Promise.resolve();
			}
		})
	);

	var instance = new MyType();
	
	instance.save().then(() => {
		instance.destroy().then(() => {
			assert.equal(MyType.current, undefined);
			assert.rejects(MyType.currentPromise);
			done();
		});
	});
});

QUnit.test('Allows for configurable destroy method name', function(assert){
	var done = assert.async();
	assert.expect(2);
	var MyType = singleton({ destroyMethodName: 'doFooBar' })(
		DefineMap.extend({
			get: function() {
				return Promise.resolve();
			}
		}, {
			save: function() {
				return Promise.resolve(this);
			},
			doFooBar: function() {
				return Promise.resolve();
			}
		})
	);

	var instance = new MyType();

	instance.save().then(() => {
		instance.doFooBar().then(() => {
			assert.equal(MyType.current, undefined);
			assert.rejects(MyType.currentPromise);
			done();
		});
	});
});

QUnit.test('Setting .current manually results in expected state.', function(assert){
	assert.expect(4);
	var done = assert.async();
	var MyType = singleton(
		DefineMap.extend({
			get: function() {
				assert.ok(false, 'fetch method should never be run while setting .current manually.');
				return Promise.resolve();
			}
		})
	);

	var instance = new MyType();
	var promises = [];

	MyType.current = instance;
	assert.equal(MyType.current, instance);
	promises.push(MyType.currentPromise.then((ins) => assert.equal(ins, instance)));

	MyType.current = undefined;
	assert.equal(MyType.current, undefined);
	promises.push(assert.rejects(MyType.currentPromise));

	Promise.all(promises).then(() => done());
});

