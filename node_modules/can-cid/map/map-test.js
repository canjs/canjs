'use strict';

var QUnit = require('steal-qunit');
var CIDMap = require('./map');

QUnit.module("can-cid/map");

QUnit.test("basics", function(assert) {
	var o1 = {},
		o2 = {},
		o3 = {};

	var map = new CIDMap();

	map.set(o1,"o1");
	map.set(o2,"o2");

	assert.equal( map.get(o1), "o1");
	assert.equal( map.get(o2), "o2");
	assert.equal( map.get(o3), undefined);

	assert.equal(map.size, 2);

	map.clear();

	assert.equal(map.size, 0);
});


QUnit.test("forEach", function(assert) {
	var o1 = {},
		o2 = {};

	var map = new CIDMap();

	map.set(o1,"o1");
	map.set(o2,"o2");


	map.forEach(function(value, key){
		if(value === "o1") {
			assert.equal(key, o1);
		} else if(value === "o2") {
			assert.equal(key, o2);
		} else {
			assert.ok(false, "key shouldn't be "+value);
		}
	});
});
