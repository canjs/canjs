'use strict';

var QUnit = require('steal-qunit');
var diffObject = require('./map');

QUnit.module("can-diff/map/map");

QUnit.test("basics", function(assert){
		var patches = diffObject({}, {a:'foo'});
		assert.deepEqual(patches, [{
			key: 'a',
			type: 'add',
			value: 'foo'
		}], "add key");

		patches = diffObject(null, {a:'foo'});
		assert.deepEqual(patches, [{
			key: 'a',
			type: 'add',
			value: 'foo'
		}], "add key - oldObject null");

		patches = diffObject({a: 'foo'}, {a:'bar'});
		assert.deepEqual(patches, [{
			key: 'a',
			type: 'set',
			value: 'bar'
		}], "change key");

		patches = diffObject({a: 'foo'}, {});
		assert.deepEqual(patches, [{
			key: 'a',
			type: 'delete'
		}], "delete key");

		patches = diffObject({a: 'foo', b: 'baz'}, {a: 'bar', c: 'quz'});
		assert.deepEqual(patches, [{
			key: 'a',
			type: 'set',
			value: 'bar'
		}, {
			key: 'c',
			type: 'add',
			value: 'quz'
		}, {
			key: 'b',
			type: 'delete'
		}], "add, set, and delete");
});

QUnit.test("mutation test", function(assert){
	var oldObject = {a: 'foo', b: 'baz'};
	var newObject = {a: 'bar', c: 'quz'};

	diffObject(oldObject, newObject);
	assert.deepEqual(oldObject, {a: 'foo', b: 'baz'}, 'should not mutate old object');
	assert.deepEqual(newObject, {a: 'bar', c: 'quz'}, 'should not mutate new object');
});
