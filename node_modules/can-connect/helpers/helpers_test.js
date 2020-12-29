require("./map-deep-merge-test");
require("./weak-reference-set-test");

var idMerge = require("./id-merge");

var QUnit = require("steal-qunit");

QUnit.module("helpers");

QUnit.test("id-merge", function(assert) {

	// var onSplice = function(arr, fn) {
	// 	var splice = arr.splice;
	// 	arr.splice = function() {
	// 		fn.apply(this, arguments);
	// 		return splice.apply(this, arguments);
	// 	};
	// 	return arr;
	// };

	var returnArg = function(arg){ return arg; };

	var list;
	/*idMerge(list = [],[1,2,3],returnArg, returnArg);
	deepEqual(list,[1,2,3]);

	list = onSplice([1,2,3], function(){
		ok(false, "splice called");
	});

	idMerge(list,[1,2,3],returnArg, returnArg);
	deepEqual(list,[1,2,3],"same list");

	list = onSplice([1,2,4], function(index, howMany, insert){
		equal(index,2);
		equal(howMany,0);
		equal(insert,3);
	});

	idMerge(list,[1,2,3,4],returnArg, returnArg);
	deepEqual(list,[1,2,3,4], "added 4");


	list = onSplice([1,2,3,4], function(index, howMany, insert){
		equal(index,2);
		equal(howMany,1);
		equal(insert,undefined);
	});

	idMerge(list,[1,2,4],returnArg, returnArg);
	deepEqual(list,[1,2,4]);*/



	idMerge(list = ["a","b","z","f","x"],["a","b","f","w","z"],returnArg, returnArg);
	assert.deepEqual(list,["a","b","f","w","z"]);


});
