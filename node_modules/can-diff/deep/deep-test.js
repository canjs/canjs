'use strict';

var QUnit = require('steal-qunit');
var diffDeep = require('./deep');
var canReflect = require("can-reflect");

QUnit.module("can-diff/deep/deep");

QUnit.test("acts just like diff map", function(assert){
	var patches = diffDeep({}, {a:'foo'});
	assert.deepEqual(patches, [{
		key: 'a',
		type: 'add',
		value: 'foo'
	}], "add key");

	patches = diffDeep(null, {a:'foo'});
	assert.deepEqual(patches, [{
		key: 'a',
		type: 'add',
		value: 'foo'
	}], "add key - oldObject null");

	patches = diffDeep({a: 'foo'}, {a:'bar'});
	assert.deepEqual(patches, [{
		key: 'a',
		type: 'set',
		value: 'bar'
	}], "change key");

	patches = diffDeep({a: 'foo'}, {});
	assert.deepEqual(patches, [{
		key: 'a',
		type: 'delete'
	}], "delete key");

	patches = diffDeep({a: 'foo', b: 'baz'}, {a: 'bar', c: 'quz'});
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

QUnit.test("acts like diff/list", function(assert){

	var patches = diffDeep([], [1,2,3]);
	assert.deepEqual(patches, [{
		type: "splice",
		index: 0,
		deleteCount: 0,
		insert: [1,2,3]
	}], "insert many at end");

	patches = diffDeep([1,2,3], [1,2,3]);
	assert.deepEqual(patches,[],"no changes");

	patches = diffDeep([1,2,3],[1,2,3,4]);
	assert.deepEqual(patches, [{
		type: "splice",
		index: 3,
		deleteCount: 0,
		insert: [4]
	}],"add one at the end");

	patches = diffDeep([1,2,3,4], [1,2,4]);

	assert.deepEqual(patches, [{
		type: "splice",
		index: 2,
		deleteCount: 1,
		insert: []
	}],"remove one in the middle");

	patches = diffDeep(["a","b","z","f","x"],
	                ["a","b","f","w","z"]);
	assert.deepEqual(patches, [{
		type: "splice",
		index: 2,
		insert: [],
		deleteCount: 1
	},{
		type: "splice",
		index: 3,
		deleteCount: 1,
		insert: ["w","z"]
	}]);

	patches = diffDeep(["a","b","b"],["c","a","b"]);
	assert.deepEqual(patches, [{
		type: "splice",
		index: 0,
		insert: ["c"],
		deleteCount: 0
	},{
		type: "splice",
		index: 3,
		deleteCount: 1,
		insert: []
	}]);

	// a, b, c, d, e, f, g
	// a, c, d, e, f, g
	// a, c, e, f, g
	// a, c, e, g
	patches = diffDeep(["a","b","c","d","e","f","g"],["a","c","e","g"]);
	assert.deepEqual(patches, [{
		type: "splice",
		index: 1,
		insert: [],
		deleteCount: 1
	},{
		type: "splice",
		index: 2,
		deleteCount: 1,
		insert: []
	},
	{
		type: "splice",
		index: 3,
		deleteCount: 1,
		insert: []
	}]);


});

QUnit.test("able to do deep", function(assert){
    var patches = diffDeep({inner: {}}, {inner: {a:'foo'}});
	assert.deepEqual(patches, [{
		key: 'inner.a',
		type: 'add',
		value: 'foo'
	}], "add key to inner");


    patches = diffDeep({inner: []}, {inner: ['a']});
	assert.deepEqual(patches, [{
		key: 'inner',
        type: "splice",
		index: 0,
		deleteCount: 0,
		insert: ['a']
	}], "add value to inner");

});

function addSchemaForId(obj){
	if(Array.isArray(obj)) {
		return obj.map(addSchemaForId);
	} else {
		return canReflect.assignSymbols(obj,{
			"can.getSchema": function(){
				return {type: "map", identity: ["id"]};
			}
		});
	}

}

QUnit.test("able to diff a deep list", function(assert){
	var arr1 = [{a:1}],
		arr2 = [{a:1}]

	var patches = diffDeep(arr1, arr2);
	assert.deepEqual(patches,[], "no changes");



	var obj = canReflect.assignSymbols({id:1, name: "Mike"},{
		"can.getSchema": function(){
			return {type: "map", identity: ["id"]};
		}
	});

	patches = diffDeep(
		[obj],
		[{id: 1, name: "Justin"}]);

	assert.deepEqual(patches, [{
		key: '0.name',
		type: 'set',
		value: 'Justin'
	}], 'identity used to say two values are the same and patches flow from within');


	patches = diffDeep(
		addSchemaForId([{id: 1}, {id: 2}, {id: 3}, {id: 4}]),
		addSchemaForId([{id: 1, name: "a"}, {id: 4}, {id: 3}, {id: 2}])
	)

	assert.deepEqual(patches, [
		{
			"key": "0.name",
			"type": "add",
			"value": "a"
		},
		{
			"type": "splice",
			"index": 1,
			"deleteCount": 3,
			"insert": [
				{
					"id": 4
				},
				{
					"id": 3
				},
				{
					"id": 2
				}
			]
		}
	])

	patches = diffDeep(
		addSchemaForId([{id: 1}, {id: 2}, {id: 3}]),
		addSchemaForId([{id: 1}, {id: 9}, {id: 2}, {id: 3, name: "a"}])
	);
	assert.deepEqual(patches, [
		{
			"key": "2.name",
			"type": "add",
			"value": "a"
		},
		{
			"index": 1,
			"deleteCount": 0,
			"insert": [
				{
					"id": 9
				}
			],
			"type": "splice"
		}
	], "insertion");


	patches = diffDeep(
		{
			"name": "cheese burger",
			"instructions": [
				{
					"description": "heat meat"
				},
				{
					"description": "add cheese"
				}
			],
			"cookbook": {
				"title": "Justin's Grillin Times"
			}
		},
		{
			"name": "cheese burger",
			"instructions": [
				{
					"description": "heat meat"
				},
				{
					"description": "add cheese"
				}
			],
			"cookbook": {
				"title": "Justin's Grillin Times"
			}
		}
	);

	assert.deepEqual(patches,[]);
});
