'use strict';

var QUnit = require('steal-qunit');
var diff = require('./list');
var canReflect = require("can-reflect");

QUnit.module("can-diff/list/list");

QUnit.test("basics", function(assert){

	var patches = diff([], [1,2,3]);
	assert.deepEqual(patches, [{
		type: "splice",
		index: 0,
		deleteCount: 0,
		insert: [1,2,3]
	}], "insert many at end");

	patches = diff([1,2,3], [1,2,3]);
	assert.deepEqual(patches,[],"no changes");

	patches = diff([1,2,3],[1,2,3,4]);
	assert.deepEqual(patches, [{
		type: "splice",
		index: 3,
		deleteCount: 0,
		insert: [4]
	}],"add one at the end");

	patches = diff([1,2,3,4], [1,2,4]);

	assert.deepEqual(patches, [{
		type: "splice",
		index: 2,
		deleteCount: 1,
		insert: []
	}],"remove one in the middle");

	patches = diff(["a","b","z","f","x"],
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

	patches = diff(["a","b","b"],["c","a","b"]);
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
	patches = diff(["a","b","c","d","e","f","g"],["a","c","e","g"]);
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

	// identity:
	patches = diff([{id:1},{id:2}], [{id:1},{id:1.5},{id:3}], function(a,b){ return a.id === b.id; });
	assert.deepEqual(patches, [{
		type: "splice",
		index: 1,
		deleteCount: 1,
		insert: [{id:1.5},{id:3}]
	}], 'identity works');

	// identity for a single middle insertion:
	patches = diff([{id:1},{id:2}], [{id:1},{id:3},{id:2}], function(a,b){ return a.id === b.id; });
	assert.deepEqual(patches, [{
		type: "splice",
		index: 1,
		deleteCount: 0,
		insert: [{id:3}]
	}], 'identity for a single middle insertion');
});


QUnit.test("no .values on provided list schema", function(assert){
	var patches = diff([], [1,2,3], {type: "list"});
	assert.deepEqual(patches, [{
		type: "splice",
		index: 0,
		deleteCount: 0,
		insert: [1,2,3]
	}], "insert many at end");
});

QUnit.test("no .values on provided list schema", function(assert){
	var patches = diff([], [1,2,3], {type: "list"});
	assert.deepEqual(patches, [{
		type: "splice",
		index: 0,
		deleteCount: 0,
		insert: [1,2,3]
	}], "insert many at end");

	var src = [];

	canReflect.assignSymbols(src,{
		"can.getSchema": function(){
			return {type: "list"};
		}
	});

	patches = diff(src, [1,2,3]);
	assert.deepEqual(patches, [{
		type: "splice",
		index: 0,
		deleteCount: 0,
		insert: [1,2,3]
	}], "insert many at end");
});

QUnit.test("tollerate no identity keys", function(assert){
	var obj = canReflect.assignSymbols({id:1},{
		"can.getSchema": function(){
			return {type: "map", identity: []};
		}
	});
	var patches = diff([obj,{id:2}], [{id:1},{id:3},{id:2}]);
	assert.deepEqual(patches, [{
		type: "splice",
		index: 0,
		deleteCount: 2,
		insert: [{id:1},{id:3},{id:2}]
	}], 'identity for a single middle insertion');
});
