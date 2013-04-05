steal("can/util/array/makeArray.js","can/util/array/reduce.js",function(){ 

// Tests that a library wrapper has to pass
module("Library wrapper");

test("can.trim", function () {

});

test("can.makeArray", function () {
	deepEqual([], can.makeArray(null), "Empty argument creates empty array");

	var array = ['one', 'two', 'three'];
	var made = can.makeArray(array);
	notEqual(array, can.makeArray(array), "Should return a cloned version of the array");
});

test("can.isArray", function () {

});

test("can.inArray", function () {
	equal(-1, can.inArray('test'), 'Passing an undefined array returns -1');
})

test("can.isPlainObject", function () {

});

test("can.extend", function () {

});

test("can.isEmptyObject", function () {

});

test("can.reduce", function() {
  equal(undefined, can.reduce(null));
  var array = [1,2,3,4], add = function(a, b) { return a+b; };
  equal(10, can.reduce(array, add));
  equal(25, can.reduce(array, add, 15));
  
  array = ["a","b","c","d"];
  array.reduce = null; //override native reduce
  equal("abcd", can.reduce(array, add));
  equal("zabcd", can.reduce(array, add, "z"));
});

test("can.reduceRight", function() {
  equal(undefined, can.reduceRight(null));
  var array = ["a", "b", "c", "d"], 
      add = function(a, b) { return a+b; },
      verify = function(t, b, i, arr) { 
        equal(arr, array); 
        ok(i < t, "iterating in reverse. i = " + i + " t = " + t); 
        return i; }
      ;
  equal("dcba", can.reduceRight(array, add));
  equal("zdcba", can.reduceRight(array, add, "z"));
  
  array.reduceRight = null; //override native reduce
  equal("dcba", can.reduceRight(array, add));
  equal("zdcba", can.reduceRight(array, add, "z"));

  //test that the array passed is not reversed
  can.reduceRight(array, verify, array.length);
});


});
