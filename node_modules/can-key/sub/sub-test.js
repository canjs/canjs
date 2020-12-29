var sub = require("./sub");
var QUnit = require("steal-qunit");

QUnit.module("can-key/sub");

QUnit.test('string.sub', function (assert) {
	assert.equal( sub('a{b}', {
		b: 'c'
	}), 'ac');
	var foo = {
		b: 'c'
	};
	assert.equal( sub('a{b}', foo, true), 'ac');
	assert.ok(!foo.b, 'b\'s value was removed');
});

QUnit.test('string.sub with undefined values', function (assert) {
	var subbed =  sub('test{exists} plus{noexists}', {
		exists: 'test'
	});
	assert.deepEqual(subbed, null, 'Rendering with undefined values should return null');
	subbed =  sub('test{exists} plus{noexists}', {
		exists: 'test'
	}, true);
	assert.deepEqual(subbed, null, 'Rendering with undefined values should return null even when remove param is true');
});

QUnit.test('string.sub with null values', function (assert) {
	var subbed =  sub('test{exists} plus{noexists}', {
		exists: 'test',
		noexists: null
	});
	assert.deepEqual(subbed, null, 'Rendering with null values should return null');
	subbed =  sub('test{exists} plus{noexists}', {
		exists: 'test',
		noexists: null
	}, true);
	assert.deepEqual(subbed, null, 'Rendering with null values should return null even when remove param is true');
});

QUnit.test('string.sub double', function (assert) {
	assert.equal( sub('{b} {d}', {
		b: 'c',
		d: 'e'
	}), 'c e');
});
