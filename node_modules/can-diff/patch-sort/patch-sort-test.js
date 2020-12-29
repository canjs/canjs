var QUnit = require('steal-qunit');
var diff = require('../list/list');
var canReflect = require("can-reflect");
var patchSort = require("./patch-sort");

QUnit.module("can-diff/patch-group/patch-sort");

function applyPatch(arr, patch){
	//{"index":0,"deleteCount":0,"insert":["sloth"],"type":"splice"}
	arr.splice.apply(arr, [patch.index, patch.deleteCount || 0].concat(patch.insert || []));
}

function patchSequence(sequence) {
	var patches = [];
	for(var i = 1; i < sequence.length; i++) {
		patches.push.apply(patches, diff(sequence[i-1], sequence[i]) );
	}
	return patches;
}

function sortAndVerifyPatches(patches, sequence,assert,name) {
	var sorted = patchSort(patches);

	var clone = sequence[0].slice(0);


	sorted.forEach(function(patch){
		applyPatch(clone, patch);
	});

	assert.deepEqual(clone,sequence[sequence.length - 1], name);
}

function testSequence(sequence, assert, name) {
	var patches=  patchSequence(sequence);
	sortAndVerifyPatches(patches, sequence, assert, name);
}

QUnit.test("basics", function(assert){


	testSequence([
		["a","b"],
		["b","C"]
	], assert, "insert after remove");


	testSequence([
		["a","b","c"],
		["b","c","D"]
	], assert, "insert after remove with multiple items");

	testSequence([
			["a","b"],
			["C","a"]
		], assert, "insert before remove");

	testSequence([
		["a","b"],
		["C","D","a"]
	], assert, "insert before remove with multiple items");

	testSequence([
			[1,2,3,4],
			[1,2,4]
		], assert, "remove entry");

	testSequence([
			[1,2,4],
			[1,2,3,4]
		], assert, "insert entry");
});
