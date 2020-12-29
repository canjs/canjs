var QUnit = require("steal-qunit");
var helpers = require("./helpers");
var canReflect = require("can-reflect");

QUnit.module("can-query-logic/helpers");


QUnit.test('.getIdentityIndex', function(assert){
	var items = [
		{id: 1, name: "Item 0"},
		{id: 2, name: "Item 1"},
		{id: 3, name: "Item 1"},
		{id: 4, name: "Item 1"},
		{id: 5, name: "Item 2"}
	];

	canReflect.eachIndex(items, function(item) {
		canReflect.assignSymbols(item, {
			"can.getSchema": function() {
				return {
					type: "map",
					identity: ["id"],
					keys: {
						id: Number,
						name: String
					}
				};
			}
		});
	});

	var props = {id:2, name: "Item 1"};
	canReflect.assignSymbols(props,{
		"can.getSchema": function() {
			return {
				type: "map",
				identity: ["id"],
				keys: {
					id: Number,
					name: String
				}
			};
		}
	});
	var compare = helpers.sorter("name", {});
	var res = helpers.getIdentityIndex(compare, items, props, 1);
	assert.deepEqual(res, 1);
});

QUnit.test(".getIndex should not sort unchanged items #33", function(assert) {
	
	var items = [
		{id: 1, name: "Item 0"},
		{id: 2, name: "Item 1"},
		{id: 3, name: "Item 1"},
		{id: 4, name: "Item 1"},
		{id: 5, name: "Item 2"}
	];

	canReflect.eachIndex(items, function(item) {
		canReflect.assignSymbols(item, {
			"can.getSchema": function() {
				return {
					type: "map",
					identity: ["id"],
					keys: {
						id: Number,
						name: String
					}
				};
			}
		});
	});

	var compare = helpers.sorter("name", {});

	var res1 = helpers.getIndex(compare,items, items[0]);
	var res2 = helpers.getIndex(compare,items, items[1]);
	var res3 = helpers.getIndex(compare,items, items[2]);
	var res4 = helpers.getIndex(compare,items, items[3]);
	
	
	assert.equal(res1, 0);
	assert.equal(res2, 1);
	assert.equal(res3, 2);
	assert.equal(res4, 3);
});

QUnit.test("Missed schema on helper.getIndex #45", function(assert) {
	var items = [
		{id: 1, name: "Item 0"},
		{id: 2, name: "Item 1"},
		{id: 3, name: "Item 2"},
		{id: 4, name: "Item 3"},
		{id: 5, name: "Item 4"}
	];
	
	var compare = helpers.sorter("name", {});
	var schema = { keys: {}, identity: ["id"] };
	
	assert.equal(helpers.getIndex(compare,items, {id: 2, name: "Item 1"}, schema), 1);
});
