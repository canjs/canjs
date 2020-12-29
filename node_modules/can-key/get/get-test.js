'use strict';

var QUnit = require('steal-qunit');

var get  = require('./get');
var canReflect = require("can-reflect");

QUnit.module('can-key/get');

QUnit.test('get Single root', function (assert) {
	// ## Single root
	var root, result;
	// # Only get
	root = {
		foo: 'bar'
	};
	// exists
	result = get(root, 'foo');
	assert.equal(result, 'bar', 'got \'bar\'');
	// not exists
	result = get(root, 'baz');
	assert.equal(result, undefined, 'got \'undefined\'');
});

QUnit.test('get Deep objects', function (assert) {
	// ## Deep objects
	var root, result;
	// # Only get
	root = {
		foo: {
			bar: 'baz'
		}
	};
	// exists
	result = get(root, 'foo.bar');
	assert.equal(result, 'baz', 'got \'baz\'');
	// not exists
	result = get(root, 'foo.world');
	assert.equal(result, undefined, 'got \'undefined\'');

	result = get(root, 'baz.world');
	assert.equal(result, undefined, 'got \'undefined\'');
});

QUnit.test('get with numeric index', function (assert) {
	var list = [1,2,3],
		result0 = get(list, 0);

	assert.equal(result0, 1, 'got the 1st element of the list');

	var result1 = get(list, 1);
	assert.equal(result1, 2, 'got the 2nd element of the list');
});

QUnit.test("works with reflected APIs", function(assert){
    var obj = canReflect.assignSymbols({},{
        "can.getKeyValue": function(key){
            return this._data[key];
        }
    });
    obj._data = {foo: {
        bar: "zed"
    }};

    var result = get(obj, "foo.bar");
    assert.equal(result, "zed", 'got \'zed\'');
});

if(typeof Map !== undefined) {
    QUnit.test("works with reflected APIs and Map", function(assert){

        var map = new Map();
        map.set("first", {second: "third"});
        assert.equal( get(map, "first.second"),  "third");

        var key = {};

        map = new Map();
        map.set(key, {second: "third"});
        assert.equal( get(map, [key, "second"]),  "third");

    });
}
